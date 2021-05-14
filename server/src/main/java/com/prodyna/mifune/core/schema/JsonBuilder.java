package com.prodyna.mifune.core.schema;

/*-
 * #%L
 * prodyna-mifune-server
 * %%
 * Copyright (C) 2021 PRODYNA SE
 * %%
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * #L%
 */

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.prodyna.mifune.domain.Property;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

public class JsonBuilder {

  private final Set<String> labels = new HashSet<>();
  private final ObjectNode json = new ObjectMapper().createObjectNode();
  private final CypherContext cypherContext = new CypherContext();
  private final UUID domainId;


  public JsonBuilder(GraphModel graphModel, UUID domainId) {
    this.domainId = domainId;
    var rootNode = graphModel.rootNode(domainId);
    var varPath = new ArrayList<String>();
    varPath.add("model");
    buildSubContext(varPath, json, rootNode);

  }

  public ObjectNode getJson() {
    return json;
  }

  private void buildSubContext(
      List<String> varPath,
      ObjectNode parentNode,
      NodeModel node
  ) {
    var contextVarPath = new ArrayList<>(varPath);
    var currentNode = parentNode.putObject(nodeVarName(node));
    buildProperies(currentNode, node.getProperties());
    contextVarPath.add(nodeVarName(node));
    cypherContext.getStatements().add(buildMerge(contextVarPath, node));
    var add = labels.add(node.getLabel());
    if (add) {
      node.getRelations().stream()
          .filter(r -> r.getDomainIds().contains(domainId))
          .filter(r -> r.getTo().getDomainIds().contains(domainId))
          .forEach(
          r -> buildRelation(contextVarPath, currentNode, r)
      );
    }

  }

  private void buildRelation(
      List<String> varPath,
      ObjectNode parentNode,
      RelationModel r) {
    if (!r.isMultiple()) {
      var currentNode = parentNode.putObject(relationVarName(r));
      buildSingleRelation(varPath, r, currentNode);
    } else {
      var arrayNode = parentNode.putArray(relationVarName(r));
      var currentNode = arrayNode.addObject();
      buildMultiRelation(varPath, r, currentNode);
    }

  }

  private void buildSingleRelation(
      List<String> varPath,
      RelationModel r,
      ObjectNode currentNode
  ) {
    buildProperies(currentNode, r.getProperties());
    if (r.getTo().isPrimary()) {
      var newPath = new ArrayList<>(varPath);
      newPath.add(relationVarName(r));
      buildSubContext(newPath, currentNode, r.getTo());
      cypherContext.getStatements().add(
          "merge(%s)-[%s:%s]->(%s)"
              .formatted(nodeVarName(r.getFrom()), relationVarName(r), r.getType(),
                  nodeVarName(r.getTo()))
      );
    } else {
      var newPath = new ArrayList<>(varPath);
      newPath.add(relationVarName(r));
      buildSubContext(newPath, currentNode, r.getTo());
      cypherContext.getStatements().add(
          "merge(%s)-[%s:%s]->(%s:%s)"
              .formatted(
                  nodeVarName(r.getFrom()),
                  relationVarName(r),
                  r.getType(),
                  nodeVarName(r.getTo()),
                  r.getTo().getLabel()
              )
      );

    }
  }

  private void buildMultiRelation(
      List<String> varPath,
      RelationModel r,
      ObjectNode currentNode
  ) {
    buildProperies(currentNode, r.getProperties());
    var varName = nodeVarName(r.getFrom());
    var contextVarPath = new ArrayList<>(List.of(varName));
    buildSubContext(contextVarPath, currentNode, r.getTo());

  }

  private String buildMerge(List<String> varPath, NodeModel node) {
    return "merge(%s:%s%s)".formatted(nodeVarName(node), node.getLabel(),
        primaryKeys(varPath, node.getProperties()));
  }

  private String primaryKeys(List<String> varPath, List<Property> properties) {
    var primaryKeys = Optional.ofNullable(properties)
        .stream()
        .flatMap(Collection::stream)
        .filter(Property::isPrimary).collect(Collectors.toList());
    if (primaryKeys.isEmpty()) {
      return "";
    }

    var sb = new StringBuilder(" {");
    primaryKeys.forEach(property -> sb.append(property.getName())
        .append(":")
        .append(String.join(".", varPath))
        .append(".")
        .append(property.getName()));
    sb.append("}");
    return sb.toString();
  }


  private void buildProperies(ObjectNode jsonNodes, List<Property> properties) {
    Optional.ofNullable(properties)
        .stream()
        .flatMap(Collection::stream)
    .forEach(p -> {
      switch (p.getType()) {
        case "string" -> jsonNodes.put(p.getName(), "string");
        case "long" -> jsonNodes.put(p.getName(), 1L);
        case "boolean" -> jsonNodes.put(p.getName(), true);
      }
    });
  }

  private String nodeVarName(NodeModel node) {
    var label = node.getLabel();
    return label.substring(0, 1).toLowerCase() + label.substring(1);
  }

  private String relationVarName(RelationModel relationModel) {
    var type = relationModel.getType();
    var parts = Arrays.asList(type.split("_"));
    var varName = parts.stream()
        .map(String::toLowerCase)
        .map(s -> s.substring(0, 1).toUpperCase() + s.substring(1))
        .collect(Collectors.joining());
    return varName.substring(0, 1).toLowerCase() + varName.substring(1);
  }

}
