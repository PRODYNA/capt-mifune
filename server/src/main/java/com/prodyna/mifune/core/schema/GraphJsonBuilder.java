package com.prodyna.mifune.core.schema;

/*-
 * #%L
 * prodyna-mifune-parent
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

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.prodyna.mifune.domain.Property;
import java.util.*;

public class GraphJsonBuilder {

  private final ObjectNode json = new ObjectMapper().createObjectNode();
  private final UUID domainId;
  private final boolean primaryOnly;

  public GraphJsonBuilder(GraphModel graphModel, UUID domainId, boolean primaryOnly) {
    this.domainId = domainId;
    this.primaryOnly = primaryOnly;
    var rootNode = graphModel.rootNode(domainId);
    var varPath = new ArrayList<String>();
    varPath.add("model");
    buildSubContext(varPath, json, rootNode);
  }

  public ObjectNode getJson() {
    return json;
  }

  private void buildSubContext(List<String> varPath, ObjectNode parentNode, NodeModel node) {
    var contextVarPath = new ArrayList<>(varPath);
    var currentNode = parentNode.putObject(node.varName());
    buildProperties(currentNode, node.getProperties());
    contextVarPath.add(node.varName());
    node.getRelations().stream()
        .filter(r -> r.getDomainIds().contains(domainId))
        .filter(r -> r.getTo().getDomainIds().contains(domainId))
        .filter(r -> !varPath.contains(r.getTo().varName()))
        .forEach(r -> buildRelation(contextVarPath, currentNode, r));
  }

  private void buildRelation(List<String> varPath, ObjectNode parentNode, RelationModel r) {
    if (!r.isMultiple()) {
      var currentNode = parentNode.putObject(r.varName());
      buildRelation(varPath, r, currentNode);
    } else {
      var arrayNode = parentNode.putArray(r.varName());
      var currentNode = arrayNode.addObject();
      buildRelation(varPath, r, currentNode);
    }
  }

  private void buildRelation(List<String> varPath, RelationModel r, ObjectNode currentNode) {
    buildProperties(currentNode, r.getProperties());
    var newPath = new ArrayList<>(varPath);
    newPath.add(r.varName());
    buildSubContext(newPath, currentNode, r.getTo());
  }

  private void buildProperties(ObjectNode jsonNodes, List<Property> properties) {
    Optional.ofNullable(properties).stream()
        .flatMap(Collection::stream)
        .filter(p -> p.primary() || !primaryOnly)
        .forEach(
            p -> {
              switch (p.type()) {
                case "string" -> jsonNodes.put(p.name(), "string");
                case "long" -> jsonNodes.put(p.name(), "long");
                case "double" -> jsonNodes.put(p.name(), "double");
                case "boolean" -> jsonNodes.put(p.name(), "boolean");
              }
            });
  }
}
