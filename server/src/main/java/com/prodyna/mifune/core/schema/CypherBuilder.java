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

import static java.util.function.Predicate.not;

import com.prodyna.mifune.domain.Property;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

public class CypherBuilder {

	private final CypherContext rootContext;
	private final AtomicInteger counter = new AtomicInteger();
	private final Set<String> labels = new HashSet<>();
	private final UUID domainId;

	public CypherBuilder(GraphModel graphModel, UUID domainId) {
		this.domainId = domainId;
		this.rootContext = new CypherContext();
		this.rootContext.setRoot(true);
		var rootNode = graphModel.rootNode(domainId);
		var varPath = new ArrayList<String>();
		varPath.add("$model");
		var nodeVar = generateVar();
		rootContext.setRootVar(nodeVar);
		buildSubContext(varPath, rootContext, rootNode, nodeVar, true);
	}

	public String generateVar() {
		return "var_" + counter.incrementAndGet();
	}

	public String getCypher() {
		return this.rootContext.toCypher(true, 0, new AtomicInteger()).strip();
	}

	private void buildSubContext(List<String> varPath, CypherContext cypherContext, NodeModel node, String nodeVar,
			boolean createMerge) {
		var contextVarPath = new ArrayList<>(varPath);
		contextVarPath.add(modelVarName(node));
		if (createMerge) {
			buildMerge(cypherContext, contextVarPath, node, nodeVar, true);
		}
		var add = labels.add(node.getLabel());
		if (add) {
			node.getRelations().stream().filter(r -> r.getDomainIds().contains(domainId))
					.filter(r -> r.getTo().getDomainIds().contains(domainId)).filter(not(RelationModel::isPrimary))
					.forEach(r -> buildRelation(contextVarPath, cypherContext, nodeVar, r));
		}
	}

	private void buildRelation(List<String> varPath, CypherContext cypherContext, String nodeVar, RelationModel r) {
		var context = new CypherContext();
		cypherContext.subContext.add(context);

		if (!r.isMultiple()) {
			buildSingleRelation(context, varPath, nodeVar, r);
		} else {
			buildMultiRelation(context, varPath, nodeVar, r);
		}
	}

	private void buildSingleRelation(CypherContext context, List<String> varPath, String nodeVar, RelationModel r) {

		var toNode = r.getTo();
		var toNodeVarName = generateVar();
		context.setRootVar(toNodeVarName);
		if (toNode.isPrimary()) {
			var newPath = new ArrayList<>(varPath);
			newPath.add(relationVarName(r));
			toNode.getProperties().stream().filter(Property::isPrimary).map(Property::getName)
					.map(n -> String.join(".", newPath) + "." + modelVarName(toNode) + "." + n)
					.forEach(context::addExistCheck);

			buildSubContext(newPath, context, toNode, toNodeVarName, true);
			context.getStatements()
					.add("merge(%s)-[%s:%s]->(%s)".formatted(nodeVar, relationVarName(r), r.getType(), toNodeVarName));
		} else {

			var newPath = new ArrayList<>(varPath);
			newPath.add(relationVarName(r));
			buildSubContext(newPath, context, toNode, toNodeVarName, true);
			context.getStatements().add("merge(%s)-[%s:%s]->(%s:%s)".formatted(nodeVar, relationVarName(r), r.getType(),
					toNodeVarName, toNode.getLabel()));
		}
	}

	private void buildMultiRelation(CypherContext context, List<String> varPath, String nodeVar, RelationModel r) {

		var varName = generateVar();
		var newPath = new ArrayList<>(varPath);
		newPath.add(relationVarName(r));
		context.getVariables().add(varName);
		context.getStatements().add("unwind %s as %s".formatted(String.join(".", newPath), varName));
		var contextVarPath = new ArrayList<>(List.of(varName));
		var toNodeVarName = generateVar();
		context.setRootVar(toNodeVarName);

		if (r.getTo().isPrimary()) {
			buildSubContext(contextVarPath, context, r.getTo(), toNodeVarName, true);
			context.getStatements().add("merge(%s)-[%s:%s%s]->(%s)".formatted(nodeVar, relationVarName(r), r.getType(),
					primaryKeys(contextVarPath, r.getProperties()), toNodeVarName));

		} else {
			context.getStatements()
					.add("create(%s)-[%s:%s%s]->(%s:%s%s)".formatted(nodeVar, relationVarName(r), r.getType(),
							primaryKeys(contextVarPath, r.getProperties()), toNodeVarName, r.getTo().getLabel(),
							primaryKeys(contextVarPath, r.getTo().getProperties())));
			buildSubContext(contextVarPath, context, r.getTo(), toNodeVarName, false);
		}
		Optional.ofNullable(r.getProperties()).stream().flatMap(Collection::stream).filter(not(Property::isPrimary))
				.forEach(p -> {
					context.getStatements()
							.add("set %s.%s = coalesce(%s.%s, %s.%s)".formatted(relationVarName(r), p.getName(),
									String.join(".", contextVarPath), p.getName(), relationVarName(r), p.getName()));
				});
	}

	private void buildMerge(CypherContext cypherContext, List<String> varPath, NodeModel node, String nodeVar,
			boolean buildDomainLink) {
		var pkRelation = node.getRelations().stream().filter(RelationModel::isPrimary).findFirst();

		pkRelation.ifPresentOrElse(r -> {

			var newVarPath = new ArrayList<String>(varPath);
			newVarPath.add(relationVarName(r));
			newVarPath.add(modelVarName(r.getTo()));
			var pkNodeVar = generateVar();
			labels.add(r.getTo().getLabel());
			buildMerge(cypherContext, newVarPath, r.getTo(), pkNodeVar, false);
			var merge = "merge(%s)<-[:%s]-(%s:%s%s)".formatted(pkNodeVar, r.getType(), nodeVar, node.getLabel(),
					primaryKeys(varPath, node.getProperties()));
			cypherContext.getStatements().add(merge);
		}, () -> {
			cypherContext.getStatements().add(
					"merge(%s:%s%s)".formatted(nodeVar, node.getLabel(), primaryKeys(varPath, node.getProperties())));
		});
		node.getProperties().stream().filter(not(Property::isPrimary)).forEach(p -> {
			cypherContext.getStatements().add("set %s.%s = coalesce(%s.%s, %s.%s)".formatted(nodeVar, p.getName(),
					String.join(".", varPath), p.getName(), nodeVar, p.getName()));
		});
		if (cypherContext.isRoot() && buildDomainLink) {
			cypherContext.getStatements().add("""
					merge (domain:Domain {id:$domainId})
					merge(%s)<-[source:DOMAIN]-(domain)
					on create set source.lines = $model.lines
					on match set source.lines = source.lines + [x in $model.lines where not x in source.lines | x]
					""".formatted(nodeVar));

		}
	}

	private String primaryKeys(List<String> varPath, List<Property> properties) {
		var primaryKeys = Optional.ofNullable(properties).stream().flatMap(Collection::stream)
				.filter(Property::isPrimary).collect(Collectors.toList());
		if (primaryKeys.isEmpty()) {
			return "";
		}

		var sb = new StringBuilder(" {");
		primaryKeys.forEach(property -> {
			sb.append(property.getName()).append(":").append(String.join(".", varPath)).append(".")
					.append(property.getName());
		});
		sb.append("}");
		return sb.toString();
	}

	private String modelVarName(NodeModel node) {
		var label = node.getLabel();
		return label.substring(0, 1).toLowerCase() + label.substring(1);
	}

	private String relationVarName(RelationModel relationModel) {
		var type = relationModel.getType();
		var parts = Arrays.asList(type.split("_"));
		var varName = parts.stream().map(String::toLowerCase).map(s -> s.substring(0, 1).toUpperCase() + s.substring(1))
				.collect(Collectors.joining());
		return varName.substring(0, 1).toLowerCase() + varName.substring(1);
	}
}
