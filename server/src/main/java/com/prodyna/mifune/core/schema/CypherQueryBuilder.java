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
import static org.neo4j.driver.internal.types.TypeConstructor.INTEGER;

import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;
import org.neo4j.driver.Record;
import org.neo4j.driver.internal.types.TypeConstructor;

public class CypherQueryBuilder {

	private final List<String> statements = new ArrayList<>();
	private final Map<String, String> vars = new TreeMap<>();
	private final AtomicInteger counter = new AtomicInteger();
	private final Set<String> labels = new HashSet<>();
	private final UUID domainId;
	private final Set<String> baseResults;
	private final List<String> orders;
	private final List<String> results;
	private final Map<String, String> filters;

	public CypherQueryBuilder(GraphModel graphModel, UUID domainId, List<String> results, List<String> orders,
			List<String> filters) {
		this.domainId = domainId;
		this.results = results;
		this.baseResults = results.stream().map(this::baseName).collect(Collectors.toSet());
		this.orders = orders;
		this.filters = filters.stream().map(s -> s.split(":"))
				.collect(Collectors.toMap(strings -> strings[0], strings -> strings[1]));

		var rootNode = graphModel.rootNode(domainId);
		var varPath = new ArrayList<String>();
		var nodeVar = generateVar(List.of(rootNode.varName()));
		buildSubContext(varPath, rootNode, nodeVar, true);
	}

	public QueryStatement getCypher() {
		var parameter = new HashMap<String, Object>();
		var statements = new ArrayList<>(this.statements);
		var resultEntities = this.vars.keySet().stream().filter(k -> this.baseResults.contains(this.vars.get(k)))
				.collect(Collectors.toSet());

		addFilterStatement(parameter, statements);
		statements.add("with distinct %s".formatted(String.join(",", resultEntities)));
		buildResult(statements);
		buildOrder(statements);

		return new QueryStatement(String.join("\n", statements), parameter);
	}

	private void buildResult(ArrayList<String> statements) {
		var returnStatement = this.results.stream().map(r -> {
			var baseName = baseName(r);
			var propName = propName(r);
			var varName = generateVar(r);
			return functionName(r)
					.map(fn -> "%s(%s.%s) as %s".formatted(fn, getVarMap().get(baseName), propName, varName))
					.orElseGet(() -> "%s.%s as %s".formatted(getVarMap().get(baseName), propName, varName));
		}).collect(Collectors.joining(","));

		statements.add("return %s".formatted(returnStatement));
	}

	private void buildOrder(ArrayList<String> statements) {
		var orders = Optional.ofNullable(this.orders).stream().flatMap(Collection::stream).map(getVarMap()::get)
				.collect(Collectors.joining(","));
		Optional.of(orders).filter(not(String::isBlank)).ifPresent(o -> statements.add("order by %s".formatted(o)));
	}

	private void addFilterStatement(HashMap<String, Object> parameter, ArrayList<String> statements) {
		var whereClauses = new ArrayList<String>();
		filters.forEach((key, value) -> {
			var varName = "var_" + counter.incrementAndGet();
			whereClauses.add("%s.%s = $%s".formatted(getVarMap().get(baseName(key)), propName(key), varName));
			parameter.put(varName, value);

		});
		Optional.of(whereClauses).filter(not(Collection::isEmpty))
				.map(c -> "with * where %s".formatted(String.join(" and ", c))).ifPresent(statements::add);
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
			return Optional.of(jsonPropertyPath.substring(jsonPropertyPath.lastIndexOf("[") + 1,
					jsonPropertyPath.lastIndexOf("]")));
		}
		return Optional.empty();
	}

	public Map<String, Object> buildResult(Record record) {
		var row = new HashMap<String, Object>();
		results.forEach(r -> {
			var value = record.get(getVarMap().get(r));
			functionName(r).ifPresentOrElse(fn -> {
				var rec = switch (fn) {
					case "count" -> value.asLong(0);
					case "sum", "avg", "min", "max" -> value.asDouble(0);
					default -> throw new UnsupportedOperationException("function not mapped");
				};
				row.put(r, rec);
			}, () -> {
				var type = TypeConstructor.valueOf(value.type().name());
				row.put(r, switch (type) {
					case NULL -> null;
					case INTEGER -> value.asInt();
					case STRING -> value.asString(null);
					case NUMBER -> value.asDouble();
					case BOOLEAN -> value.asBoolean();
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
		var varName = "var_" + counter.incrementAndGet();
		vars.put(varName, path);
		return varName;
	}

	private void buildSubContext(List<String> varPath, NodeModel node, String nodeVar, boolean buildMatch) {
		var contextVarPath = new ArrayList<>(varPath);
		if (buildMatch) {
			contextVarPath.add(node.varName());
			statements.add("optional match(%s:%s%s)".formatted(nodeVar, node.getLabel(), ""));
		}

		node.getRelations().stream().filter(r -> r.getDomainIds().contains(domainId))
				.filter(r -> r.getTo().getDomainIds().contains(domainId))
				.filter(r -> !varPath.contains(r.getTo().varName()))
				.forEach(r -> buildSingleRelation(contextVarPath, nodeVar, r));

	}

	private void buildSingleRelation(List<String> varPath, String nodeVar, RelationModel r) {

		var newPath = new ArrayList<>(varPath);
		newPath.add(r.varName());
		var relationVarName = generateVar(newPath);
		newPath.add(r.getTo().varName());
		var targetNodeVarName = generateVar(newPath);
		var targetNode = r.getTo();

		statements.add("optional match (%s)-[%s:%s]->(%s:%s)	".formatted(nodeVar, relationVarName, r.getType(),
				targetNodeVarName, targetNode.getLabel()));
		buildSubContext(newPath, targetNode, targetNodeVarName, false);
	}

}
