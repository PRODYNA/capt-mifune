package com.prodyna.mifune.api;

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

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.prodyna.mifune.core.GraphService;
import com.prodyna.mifune.core.json.JsonPathEditor;
import com.prodyna.mifune.core.schema.CypherQueryBuilder;
import com.prodyna.mifune.core.schema.GraphModel;
import io.smallrye.mutiny.Uni;
import java.util.*;
import java.util.concurrent.CompletionStage;
import java.util.stream.Collectors;
import javax.inject.Inject;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import org.jboss.resteasy.reactive.RestQuery;
import org.neo4j.driver.Driver;
import org.neo4j.driver.async.AsyncSession;

@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@Path("/data")
public class DataResource {

	@Inject
	GraphService graphService;

	@Inject
	protected Driver driver;

	@GET
	@Path("/domain/{domainId}")
	public CompletionStage<Response> query(@PathParam("domainId") UUID domainId,
			@RestQuery("results[]") List<String> results, @RestQuery("orders[]") List<String> orders,
			@RestQuery("filters[]") List<String> filters) {
		var graphModel = new GraphModel(graphService.graph());
		var cypherQueryBuilder = new CypherQueryBuilder(graphModel, domainId, results, orders, filters);
		AsyncSession session = driver.asyncSession();
		var statement = cypherQueryBuilder.getCypher();
		System.out.println(statement);
		return session.runAsync(statement.cypher(), statement.parameter())
				.thenCompose(cursor -> cursor.listAsync(cypherQueryBuilder::buildResult))
				.thenCompose(fruits -> session.closeAsync().thenApply(signal -> fruits)).thenApply(Response::ok)
				.thenApply(Response.ResponseBuilder::build);

	}

	@GET
	@Path("/domain/{domainId}/keys")
	public Uni<List<String>> createJsonModel(@PathParam("domainId") UUID id) {
		ObjectNode jsonModel = graphService.buildDomainJsonModel(id);
		List<String> paths = new JsonPathEditor().extractFieldPaths(jsonModel);
		var result = paths.stream().map(s -> s.replaceAll("\\[", "")).map(s -> s.replaceAll("]", ""))
				.sorted(Comparator.comparing((String s) -> s.split("\\.").length).thenComparing(s -> s))
				.collect(Collectors.toList());
		return Uni.createFrom().item(result);

	}

}
