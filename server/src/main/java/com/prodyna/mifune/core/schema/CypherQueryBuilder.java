package com.prodyna.mifune.core.schema;

/*-
 * #%L
 * prodyna-mifune-parent
 * %%
 * Copyright (C) 2021 - 2022 PRODYNA SE
 * %%
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * #L%
 */

import static java.util.function.Predicate.not;

import com.prodyna.mifune.core.CoreFunction;
import com.prodyna.mifune.domain.*;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.neo4j.driver.Record;

public class CypherQueryBuilder {

  private final GraphModel graphModel;
  private final Map<String, String> vars = new TreeMap<>();
  private final AtomicInteger counter = new AtomicInteger();
  private final HashMap<String, Object> parameter = new HashMap<>();
  private final Query query;
  private final List<CoreFunction> results;

  public HashMap<String, Object> getParameter() {
    return parameter;
  }

  public CypherQueryBuilder(GraphModel graphModel, Query query) {
    this.graphModel = graphModel;
    this.query = query;
    this.results =
        this.query.results().stream()
            .map(
                queryResultDefinition ->
                    CoreFunction.build(graphModel, query, queryResultDefinition))
            .collect(Collectors.toList());
  }

  public String cypher() {
    var queryNodeId = query.nodes().get(0).id();
    var cypher = new StringBuilder();
    buildNodeMatch(queryNodeId, cypher, new HashSet<>());
    cypher.append(addFilterStatement());
    cypher.append("\n");
    cypher.append(buildSubQueries());
    cypher.append("\n");
    cypher.append(buildDistinct());
    cypher.append("\n");
    cypher.append(buildResult());
    cypher.append("\n");
    cypher.append(buildOrder());
    return cypher.toString();
  }

  private void buildNodeMatch(UUID queryNodeId, StringBuilder cypher, Set<UUID> processedIds) {
    var queryNode = queryNode(queryNodeId);
    var nodeVar = generateVar(queryNode.varName());
    var nodeModel = this.graphModel.nodes.get(queryNode.nodeId());

    if (!processedIds.contains(queryNodeId)) {
      processedIds.add(queryNodeId);
      cypher.append("match(%s:%s)\n".formatted(nodeVar, nodeModel.getLabel()));
    }

    Stream.concat(
            buildOutgoingRelationMatch(cypher, queryNode, processedIds),
            buildIncomingRelationMatch(cypher, queryNode, processedIds))
        .distinct()
        .forEach(id -> buildNodeMatch(id, cypher, processedIds));
  }

  private Stream<UUID> buildOutgoingRelationMatch(
      StringBuilder cypher, QueryNode queryNode, Set<UUID> processedIds) {
    var nodeVar = generateVar(queryNode.varName());
    return this.graphModel.nodes.get(queryNode.nodeId()).getRelations().stream()
        .filter(r -> query.relations().stream().anyMatch(qr -> qr.relationId().equals(r.getId())))
        .flatMap(
            r ->
                query.relations().stream()
                    .filter(qr -> qr.relationId().equals(r.getId()))
                    .filter(qr -> qr.sourceId().equals(queryNode.id()))
                    .filter(qr -> !processedIds.contains(qr.id()))
                    .map(
                        qr -> {
                          var targetNode = queryNode(qr.targetId());
                          processedIds.add(qr.id());
                          cypher.append(
                              """
                              match(%s)-[%s:%s%s]->(%s:%s)
                              """
                                  .formatted(
                                      nodeVar,
                                      generateVar(qr.varName()),
                                      r.getType(),
                                      "n".equals(qr.depth()) ? "*0.." : "",
                                      generateVar(targetNode.varName()),
                                      graphModel.nodes.get(targetNode.nodeId()).getLabel()));

                          processedIds.add(targetNode.id());

                          return targetNode.id();
                        }));
  }

  private Stream<UUID> buildIncomingRelationMatch(
      StringBuilder cypher, QueryNode queryNode, Set<UUID> processedIds) {
    var nodeVar = generateVar(queryNode.varName());
    return graphModel.incommingRelations(queryNode.nodeId()).stream()
        .filter(r -> query.relations().stream().anyMatch(qr -> qr.relationId().equals(r.getId())))
        .flatMap(
            r ->
                query.relations().stream()
                    .filter(qr -> qr.relationId().equals(r.getId()))
                    .filter(qr -> qr.targetId().equals(queryNode.id()))
                    .filter(qr -> !processedIds.contains(qr.id()))
                    .map(
                        qr -> {
                          var sourceNode = queryNode(qr.sourceId());
                          processedIds.add(qr.id());
                          cypher.append(
                              """
                              match(%s)<-[%s:%s%s]-(%s:%s)
                              """
                                  .formatted(
                                      nodeVar,
                                      generateVar(qr.varName()),
                                      r.getType(),
                                      "n".equals(qr.depth()) ? "*0.." : "",
                                      generateVar(sourceNode.varName()),
                                      graphModel.nodes.get(sourceNode.nodeId()).getLabel()));

                          processedIds.add(sourceNode.id());
                          return sourceNode.id();
                        }));
  }

  private QueryNode queryNode(UUID queryNodeId) {
    return query.nodes().stream().filter(n -> n.id().equals(queryNodeId)).findFirst().orElseThrow();
  }

  private String buildResult() {
    var returnStatement =
        this.query.results().stream()
            .flatMap(
                r ->
                    CoreFunction.build(graphModel, query, r)
                        .results(this::generateVar, getVarMap()::get)
                        .stream())
            .collect(Collectors.joining(","));

    return "return %s".formatted(returnStatement);
  }

  private String buildDistinct() {
    var distinctStatement =
        this.results.stream()
            .map(CoreFunction::distinctObjects)
            .flatMap(Collection::stream)
            .map(getVarMap()::get)
            .distinct()
            .collect(Collectors.joining(","));
    return "with distinct %s".formatted(distinctStatement);
  }

  private String buildSubQueries() {
    return this.results.stream()
        .map(cr -> cr.subquery(this::generateVar))
        .distinct()
        .collect(Collectors.joining("\n"));
  }

  private String buildOrder() {
    var orders =
        Optional.ofNullable(this.query.orders()).stream()
            .flatMap(Collection::stream)
            .map(getVarMap()::get)
            .collect(Collectors.joining(","));
    return Optional.of(orders)
        .filter(not(String::isBlank))
        .map("order by %s"::formatted)
        .orElse("");
  }

  private String addFilterStatement() {
    var whereClauses = new ArrayList<String>();
    this.query
        .filters()
        .forEach(
            (filter) -> {
              propertyForVariable(filter.property());
              var varName = "var_" + counter.incrementAndGet();
              var propName =
                  "%s.%s"
                      .formatted(
                          getVarMap().get(baseName(filter.property())),
                          propName(filter.property()));
              parameter.put(varName, filter.value());
              var sign =
                  switch (Optional.ofNullable(filter.function()).orElse(FilterFunction.EQUAL)) {
                    case EQUAL -> "=";
                    case LESS -> "<";
                    case GREATER -> ">";
                  };
              whereClauses.add(
                  "%s %s %s".formatted(propName, sign, functionValue(filter, varName)));
            });
    return Optional.of(whereClauses)
        .filter(not(Collection::isEmpty))
        .map(c -> "with * where %s".formatted(String.join(" and ", c)))
        .orElse("");
  }

  private String functionValue(Filter filter, String varName) {
    var property = propertyForVariable(filter.property());
    if (property.type().equals(PropertyType.DATE)) {
      return "date($%s)".formatted(varName);
    }
    return "$%s".formatted(varName);
  }

  private Property propertyForVariable(String property) {
    var s = baseName(property);
    var nodeProp =
        query.nodes().stream()
            .filter(n -> n.varName().equals(baseName(property)))
            .map(QueryNode::nodeId)
            .map(graphModel::nodeById)
            .flatMap(Optional::stream)
            .flatMap(nm -> nm.getProperties().stream())
            .filter(p -> p.name().equals(propName(property)))
            .findFirst();

    return nodeProp
        .or(
            () ->
                query.relations().stream()
                    .filter(n -> n.varName().equals(baseName(property)))
                    .map(QueryRelation::relationId)
                    .map(graphModel::relationById)
                    .flatMap(Optional::stream)
                    .flatMap(nm -> nm.getProperties().stream())
                    .filter(p -> p.name().equals(propName(property)))
                    .findFirst())
        .orElseThrow();
  }

  private String baseName(String jsonPropertyPath) {
    return jsonPropertyPath.substring(0, jsonPropertyPath.lastIndexOf('.'));
  }

  private String propName(String jsonPropertyPath) {
    var prop = jsonPropertyPath.substring(jsonPropertyPath.lastIndexOf('.') + 1);
    if (prop.contains("[")) {
      prop = prop.substring(0, prop.lastIndexOf("["));
    }
    return prop;
  }

  public Map<String, Object> buildResult(Record record) {
    var row = new LinkedHashMap<String, Object>();
    this.results.forEach(r -> row.putAll(r.buildResult(record, getVarMap()::get)));
    return row;
  }

  public HashMap<String, String> getVarMap() {
    var tmp = new HashMap<String, String>();
    vars.forEach((k, v) -> tmp.put(v, k));
    return tmp;
  }

  public String generateVar(String path) {
    if (vars.containsValue(path)) {
      return vars.entrySet().stream()
          .filter(e -> e.getValue().equals(path))
          .map(Map.Entry::getKey)
          .findFirst()
          .orElseThrow();
    }
    var varName = "var_" + counter.incrementAndGet();
    vars.put(varName, path);
    return varName;
  }
}
