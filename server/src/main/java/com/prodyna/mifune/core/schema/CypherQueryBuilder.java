package com.prodyna.mifune.core.schema;

/*-
 * #%L
 * prodyna-mifune-server
 * %%
 * Copyright (C) 2021 PRODYNA SE
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

import com.prodyna.mifune.domain.Filter;
import com.prodyna.mifune.domain.Query;
import com.prodyna.mifune.domain.QueryNode;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;
import org.neo4j.driver.Record;
import org.neo4j.driver.internal.types.TypeConstructor;

public class CypherQueryBuilder {

  private final GraphModel graphModel;
  private final Map<String, String> vars = new TreeMap<>();
  private final AtomicInteger counter = new AtomicInteger();
  private final HashMap<String, Object> parameter = new HashMap<>();
  private final Query query;

  public HashMap<String, Object> getParameter() {
    return parameter;
  }

  public CypherQueryBuilder(GraphModel graphModel, Query query) {
    this.graphModel = graphModel;
    this.query = query;
  }

  public String cypher() {
    var queryNodeId = query.nodes().get(0).id();
    var cypher = new StringBuilder();
    buildNodeMatch(queryNodeId, cypher, new HashSet<UUID>());
    cypher.append(addFilterStatement());
    cypher.append("\n");
    cypher.append("with distinct %s".formatted(String.join(",", this.vars.keySet())));
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

    buildOutgoingRelationMatch(cypher, processedIds, nodeVar, nodeModel.getRelations());
    buildIncomingRelationMatch(
        cypher, processedIds, nodeVar, graphModel.incommingRelations(nodeModel.getId()));
  }

  private void buildOutgoingRelationMatch(
      StringBuilder cypher, Set<UUID> processedIds, String nodeVar, Set<RelationModel> relations) {
    relations.stream()
        .filter(r -> query.relations().stream().anyMatch(qr -> qr.relationId().equals(r.getId())))
        .forEach(
            r -> {
              query.relations().stream()
                  .filter(qr -> qr.relationId().equals(r.getId()))
                  .filter(qr -> !processedIds.contains(qr.id()))
                  .forEach(
                      qr -> {
                        var targetNode = queryNode(qr.targetId());
                        processedIds.add(qr.id());
                        cypher.append(
                            """
                                                match(%s)-[%s:%s]->(%s:%s)
                                                """
                                .formatted(
                                    nodeVar,
                                    generateVar(r.varName()),
                                    r.getType(),
                                    generateVar(targetNode.varName()),
                                    graphModel.nodes.get(targetNode.nodeId()).getLabel()));

                        processedIds.add(targetNode.id());
                        buildNodeMatch(targetNode.id(), cypher, processedIds);
                      });
            });
  }

  private void buildIncomingRelationMatch(
      StringBuilder cypher, Set<UUID> processedIds, String nodeVar, Set<RelationModel> relations) {
    relations.stream()
        .filter(r -> query.relations().stream().anyMatch(qr -> qr.relationId().equals(r.getId())))
        .forEach(
            r -> {
              query.relations().stream()
                  .filter(qr -> qr.relationId().equals(r.getId()))
                  .filter(qr -> !processedIds.contains(qr.id()))
                  .forEach(
                      qr -> {
                        var sourceNode = queryNode(qr.sourceId());
                        processedIds.add(qr.id());
                        cypher.append(
                            """
                                                match(%s)<-[%s:%s]-(%s:%s)
                                                """
                                .formatted(
                                    nodeVar,
                                    generateVar(r.varName()),
                                    r.getType(),
                                    generateVar(sourceNode.varName()),
                                    graphModel.nodes.get(sourceNode.nodeId()).getLabel()));

                        processedIds.add(sourceNode.id());
                        buildNodeMatch(sourceNode.id(), cypher, processedIds);
                      });
            });
  }

  private QueryNode queryNode(UUID queryNodeId) {
    return query.nodes().stream().filter(n -> n.id().equals(queryNodeId)).findFirst().orElseThrow();
  }

  private String buildResult() {
    var returnStatement =
        this.query.results().stream()
            .map(
                r -> {
                  var baseName = baseName(r);
                  var propName = propName(r);
                  var varName = generateVar(r);
                  return functionName(r)
                      .map(
                          fn ->
                              "%s(%s.%s) as %s"
                                  .formatted(fn, getVarMap().get(baseName), propName, varName))
                      .orElseGet(
                          () ->
                              "%s.%s as %s"
                                  .formatted(getVarMap().get(baseName), propName, varName));
                })
            .collect(Collectors.joining(","));

    return "return %s".formatted(returnStatement);
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
    this.query.filters().stream()

        .collect(Collectors.toMap(Filter::property, Filter::value))
        .forEach(
            (key, value) -> {
              var varName = "var_" + counter.incrementAndGet();
              whereClauses.add(
                  "%s.%s = $%s".formatted(getVarMap().get(baseName(key)), propName(key), varName));
              parameter.put(varName, value);
            });
    return Optional.of(whereClauses)
        .filter(not(Collection::isEmpty))
        .map(c -> "with * where %s".formatted(String.join(" and ", c)))
        .orElse("");
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

  private Optional<String> functionName(String jsonPropertyPath) {
    if (jsonPropertyPath.contains("[")) {
      return Optional.of(
          jsonPropertyPath.substring(
              jsonPropertyPath.lastIndexOf("[") + 1, jsonPropertyPath.lastIndexOf("]")));
    }
    return Optional.empty();
  }

  public Map<String, Object> buildResult(Record record) {
    var row = new HashMap<String, Object>();
    query
        .results()
        .forEach(
            r -> {
              var value = record.get(getVarMap().get(r));
              functionName(r)
                  .ifPresentOrElse(
                      fn -> {
                        var rec =
                            switch (fn) {
                              case "count" -> value.asLong(0);
                              case "sum", "avg", "min", "max" -> value.asDouble(0);
                              default -> throw new UnsupportedOperationException(
                                  "function not mapped");
                            };
                        row.put(r, rec);
                      },
                      () -> {
                        var type = TypeConstructor.valueOf(value.type().name());
                        row.put(
                            r,
                            switch (type) {
                              case NULL -> null;
                              case INTEGER -> value.asInt();
                              case STRING -> value.asString(null);
                              case NUMBER -> value.asDouble();
                              case BOOLEAN -> value.asBoolean();
                              case FLOAT -> value.asFloat();
                              default -> throw new UnsupportedOperationException(
                                  "Unknow type convertion: " + value.type().name());
                            });
                      });
            });
    return row;
  }

  public HashMap<String, String> getVarMap() {
    var tmp = new HashMap<String, String>();
    vars.forEach((k, v) -> tmp.put(v, k));
    return tmp;
  }

  public String generateVar(List<String> path) {
    return generateVar(String.join(".", path));
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
