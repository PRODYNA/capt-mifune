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
import com.prodyna.mifune.core.ImportService;
import com.prodyna.mifune.core.json.JsonPathEditor;
import com.prodyna.mifune.domain.*;
import io.smallrye.mutiny.Multi;
import io.smallrye.mutiny.Uni;
import io.vertx.mutiny.core.eventbus.EventBus;
import java.io.IOException;
import java.util.*;
import javax.inject.Inject;
import javax.validation.Valid;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.jboss.logging.Logger;

@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@Path("/graph")
@Tag(name = "graph")
public class GraphResource {

	@Inject
	protected Logger log;

	@Inject
	protected GraphService graphService;
	@Inject
	protected ImportService importService;

	@Inject
	protected EventBus eventBus;

	@GET
	public Uni<Graph> loadGraph() {
		return Uni.createFrom().item(graphService.graph());
	}

	@POST
	public Uni<Void> persistGraph() throws IOException {
		graphService.persist();
		return Uni.createFrom().voidItem();
	}

	@POST
	@Path("/reset")
	public void reset() {
		graphService.reset();
	}

	@GET
	@Path("/domains")
	public Multi<Domain> fetchDomains() {
		return Multi.createFrom().iterable(graphService.fetchDomains());
	}

	@POST
	@Path("/domain")
	public Uni<Domain> createDomain(@Valid DomainCreate model) {
		return Uni.createFrom().item(graphService.createDomain(model));
	}

	@GET
	@Path("/domain/{id}")
	public Uni<Domain> fetchDomain(@PathParam("id") UUID id) {
		return Uni.createFrom().item(graphService.fetchDomain(id));
	}

	@PUT
	@Path("/domain/{id}")
	public Uni<Domain> updateDomain(@PathParam("id") UUID id, @Valid DomainUpdate model) {
		return Uni.createFrom().item(graphService.updateDomain(id, model));
	}

	@DELETE
	@Path("/domain/{id}")
	public Uni<GraphDelta> deleteDomain(@PathParam("id") UUID id) {
		return Uni.createFrom().item(graphService.deleteDomain(id));
	}

	@POST
	@Path("/node")
	public Uni<Node> createNode(@Valid NodeCreate model) {
		return Uni.createFrom().item(graphService.createNode(model));
	}

	@PUT
	@Path("/node/{id}")
	public Uni<GraphDelta> updateNode(@PathParam("id") UUID id, @Valid NodeUpdate model) {
		return Uni.createFrom().item(graphService.updateNode(id, model));
	}

	@DELETE
	@Path("/node/{id}")
	public Uni<GraphDelta> deleteNode(@PathParam("id") UUID id) {
		return Uni.createFrom().item(graphService.deleteNode(id));
	}

	@POST
	@Path("/relation")
	public Uni<GraphDelta> createRelation(@Valid RelationCreate model) {
		return Uni.createFrom().item(graphService.createRelation(model));
	}

	@PUT
	@Path("/relation/{id}")
	public Uni<GraphDelta> updateRelation(@PathParam("id") UUID id, @Valid RelationUpdate model) {
		return Uni.createFrom().item(graphService.updateRelation(id, model));
	}

	@DELETE
	@Path("/relation/{id}")
	public Uni<GraphDelta> deleteRelation(@PathParam("id") UUID id) {
		return Uni.createFrom().item(graphService.deleteRelation(id));
	}

	@GET
	@Path("/domain/{domainId}/mapping")
	public Uni<Map<String, String>> createJsonModel(@PathParam("domainId") UUID id) {
		ObjectNode jsonModel = graphService.buildJsonModel(id);
		var mapping = Optional.ofNullable(graphService.fetchDomain(id).getColumnMapping()).orElse(Map.of());
		List<String> paths = new JsonPathEditor().extractFieldPaths(jsonModel);
		var hashmap = new TreeMap<String, String>(Comparator.comparing(String::length));
		paths.forEach(path -> hashmap.put(path, mapping.getOrDefault(path, null)));
		return Uni.createFrom().item(hashmap);
	}

	@GET
	@Path("/domain/{domainId}/import")
	public Uni<String> runImport(@PathParam("domainId") UUID domainId) {
		return importService.runImport(domainId);

	}

	/**
	 * This is used for the counter inside the table of pipelines
	 * 
	 * @param domainId
	 * @return
	 */
	@GET
	@Path("/domain/{domainId}/stats")
	@Produces(MediaType.SERVER_SENT_EVENTS)
	public Multi<Object> stats(@PathParam("domainId") UUID domainId) {
		return eventBus.localConsumer(domainId.toString()).bodyStream().toMulti();
	}

}
