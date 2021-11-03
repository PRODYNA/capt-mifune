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

import com.prodyna.mifune.domain.Property;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

public class CypherUpdateBuilder {

	private final CypherUpdateContext rootContext;
	private final AtomicInteger counter = new AtomicInteger();
	private final Set<String> labels = new HashSet<>();
	private final UUID domainId;

	public CypherUpdateBuilder(GraphModel graphModel, UUID domainId) {
		this.domainId = domainId;
		this.rootContext = new CypherUpdateContext();
		this.rootContext.setRoot(true);
		var rootNode = graphModel.rootNode(domainId);
		var varPath = new ArrayList<String>();
		varPath.add("$model");
		var nodeVar = generateVar();
		rootContext.setRootVar(nodeVar);
		buildSubContext(varPath, rootContext, rootNode, nodeVar, true, labels.add(rootNode.getLabel()));
	}

	public String generateVar() {
		return "var_" + counter.incrementAndGet();
	}

	public String getCypher() {
		return this.rootContext.toCypher(true, 0, new AtomicInteger()).strip();
	}

	private void buildSubContext(List<String> varPath, CypherUpdateContext cypherContext, NodeModel node,
			String nodeVar, boolean createMerge, boolean add) {
		var contextVarPath = new ArrayList<>(varPath);
		contextVarPath.add(node.varName());
		if (createMerge) {
			buildMerge(cypherContext, contextVarPath, node, nodeVar, true);
		}
		if (add) {
			node.getRelations().stream().filter(r -> r.getDomainIds().contains(domainId))
					.filter(r -> r.getTo().getDomainIds().contains(domainId)).filter(not(RelationModel::isPrimary))
					.forEach(r -> buildRelation(contextVarPath, cypherContext, nodeVar, r));
		}
	}

	private void buildRelation(List<String> varPath, CypherUpdateContext cypherContext, String nodeVar,
			RelationModel r) {
		var context = new CypherUpdateContext();
		cypherContext.subContext.add(context);

		if (!r.isMultiple()) {
			buildSingleRelation(context, varPath, nodeVar, r);
		} else {
			buildMultiRelation(context, varPath, nodeVar, r);
		}
	}

	private void buildSingleRelation(CypherUpdateContext context, List<String> varPath, String nodeVar,
			RelationModel r) {

		var toNode = r.getTo();
		var toNodeVarName = generateVar();
		context.setRootVar(toNodeVarName);
		if (toNode.isPrimary()) {
			var newPath = new ArrayList<>(varPath);
			newPath.add(r.varName());
			toNode.getProperties().stream().filter(Property::isPrimary).map(Property::getName)
					.map(n -> String.join(".", newPath) + "." + toNode.varName() + "." + n)
					.forEach(context::addExistCheck);

			buildSubContext(newPath, context, toNode, toNodeVarName, true, labels.add(toNode.getLabel()));
			context.getStatements()
					.add("merge(%s)-[%s:%s]->(%s)".formatted(nodeVar, r.varName(), r.getType(), toNodeVarName));
		} else {

			var newPath = new ArrayList<>(varPath);
			newPath.add(r.varName());
			buildSubContext(newPath, context, toNode, toNodeVarName, true, labels.add(toNode.getLabel()));
			context.getStatements().add("merge(%s)-[%s:%s]->(%s:%s)".formatted(nodeVar, r.varName(), r.getType(),
					toNodeVarName, toNode.getLabel()));
		}
		context.getStatements().add("with *");
	}

	private void buildMultiRelation(CypherUpdateContext context, List<String> varPath, String nodeVar,
			RelationModel r) {

		var varName = generateVar();
		var newPath = new ArrayList<>(varPath);
		newPath.add(r.varName());
		context.getVariables().add(varName);
		context.getStatements().add("unwind %s as %s".formatted(String.join(".", newPath), varName));
		var contextVarPath = new ArrayList<>(List.of(varName));
		var toNodeVarName = generateVar();
		context.setRootVar(toNodeVarName);

		if (r.getTo().isPrimary()) {
			buildSubContext(contextVarPath, context, r.getTo(), toNodeVarName, true, labels.add(r.getTo().getLabel()));
			context.getStatements().add("merge(%s)-[%s:%s%s]->(%s)".formatted(nodeVar, r.varName(), r.getType(),
					primaryKeys(contextVarPath, r.getProperties()), toNodeVarName));

		} else {
			context.getStatements()
					.add("create(%s)-[%s:%s%s]->(%s:%s%s)".formatted(nodeVar, r.varName(), r.getType(),
							primaryKeys(contextVarPath, r.getProperties()), toNodeVarName, r.getTo().getLabel(),
							primaryKeys(contextVarPath, r.getTo().getProperties())));
			buildSubContext(contextVarPath, context, r.getTo(), toNodeVarName, false, labels.add(r.getTo().getLabel()));
		}
		Optional.ofNullable(r.getProperties()).stream().flatMap(Collection::stream).filter(not(Property::isPrimary))
				.forEach(p -> {
					context.getStatements().add("set %s.%s = coalesce(%s.%s, %s.%s)".formatted(r.varName(), p.getName(),
							String.join(".", contextVarPath), p.getName(), r.varName(), p.getName()));
				});
		context.getStatements().add("with *");
	}

	private void buildMerge(CypherUpdateContext cypherContext, List<String> varPath, NodeModel node, String nodeVar,
			boolean buildDomainLink) {
		var pkRelation = node.getRelations().stream().filter(RelationModel::isPrimary).findFirst();

		pkRelation.ifPresentOrElse(r -> {

			var newVarPath = new ArrayList<String>(varPath);
			newVarPath.add(r.varName());
			newVarPath.add(r.getTo().varName());
			var pkNodeVar = generateVar();
			labels.add(r.getTo().getLabel());
			cypherContext.getVariables().add(pkNodeVar);
			buildMerge(cypherContext, newVarPath, r.getTo(), pkNodeVar, false);

			if (r.getTo().getRelations().stream().anyMatch(not(RelationModel::isPrimary))) {
				var pkNodeVarPath = new ArrayList<String>(varPath);
				pkNodeVarPath.add(r.varName());
				var cypherContext1 = new CypherUpdateContext();
				buildSubContext(pkNodeVarPath, cypherContext1, r.getTo(), pkNodeVar, false, true);
				cypherContext.getSubContext().add(cypherContext1);
			}

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
					with *
					""".formatted(nodeVar));

		}
	}

	private String primaryKeys(List<String> varPath, List<Property> properties) {
		var primaryKeys = Optional.ofNullable(properties).stream().flatMap(Collection::stream)
				.filter(Property::isPrimary).collect(Collectors.toList());
		if (primaryKeys.isEmpty()) {
			return "";
		}

		return primaryKeys.stream()
				.map(property -> property.getName() + ":" + String.join(".", varPath) + "." + property.getName())
				.collect(Collectors.joining(",", " {", "}"));
	}

}
