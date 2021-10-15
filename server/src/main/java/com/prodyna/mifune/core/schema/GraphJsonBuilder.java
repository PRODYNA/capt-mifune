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
import java.util.*;

public class GraphJsonBuilder {

	private final Set<String> labels = new HashSet<>();
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
		node.getRelations().stream().filter(r -> r.getDomainIds().contains(domainId))
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
		Optional.ofNullable(properties).stream().flatMap(Collection::stream).filter(p -> p.isPrimary() || !primaryOnly)
				.forEach(p -> {
					switch (p.getType()) {
						case "string" -> jsonNodes.put(p.getName(), "string");
						case "long" -> jsonNodes.put(p.getName(), "long");
						case "double" -> jsonNodes.put(p.getName(), "double");
						case "boolean" -> jsonNodes.put(p.getName(), "boolean");
					}
				});
	}

}
