package com.prodyna.mifune.api;

/*-
 * #%L
 * prodyna-mifune-parent
 * %%
 * Copyright (C) 2021 - 2023 PRODYNA SE
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

import com.prodyna.mifune.core.graph.GraphService;
import com.prodyna.mifune.domain.*;
import io.smallrye.mutiny.Multi;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@Path("/api/graph")
@Tag(name = "graph")
public class GraphResource {

  @Inject protected GraphService graphService;

  @GET
  @Operation(
      operationId = "fetchGraph",
      summary = "Fetch the whole graph",
      description = "Fetch the whole graph")
  public Uni<Graph> fetchGraph() {
    return Uni.createFrom().item(graphService.graph());
  }

  @POST
  @Operation(
      operationId = "persistGraph",
      summary = "Persist the whole graph",
      description = "Persist the whole graph")
  public Uni<Void> persistGraph() throws IOException {
    graphService.persist();
    return Uni.createFrom().voidItem();
  }

  @POST
  @Path("/reset")
  @Operation(
      operationId = "resetGraph",
      summary = "Reset the whole graph",
      description = "Reset the whole graph")
  public void reset() {
    graphService.reset();
  }

  @GET
  @Path("/domains")
  @Operation(
      operationId = "fetchDomains",
      summary = "Fetch all domains",
      description = "Fetch all domains")
  public Multi<Domain> fetchDomains() {
    return Multi.createFrom().iterable(graphService.fetchDomains());
  }

  @POST
  @Path("/domain")
  @Operation(
      operationId = "createDomain",
      summary = "Create a domain",
      description = "Create a domain")
  public Uni<Domain> createDomain(@Valid DomainCreate model) {
    return Uni.createFrom().item(graphService.createDomain(model));
  }

  @GET
  @Path("/domain/{id}")
  @Operation(
      operationId = "fetchDomain",
      summary = "Fetch a domain",
      description = "Fetch a domain")
  public Uni<Domain> fetchDomain(@PathParam("id") UUID id) {
    return Uni.createFrom().item(graphService.fetchDomain(id));
  }

  @PUT
  @Path("/domain/{id}")
  @Operation(
      operationId = "updateDomain",
      summary = "Update a domain",
      description = "Update a domain")
  public Uni<Domain> updateDomain(@PathParam("id") UUID id, @Valid DomainUpdate model) {
    return Uni.createFrom().item(graphService.updateDomain(id, model));
  }

  @DELETE
  @Path("/domain/{id}")
  @Operation(
      operationId = "deleteDomain",
      summary = "Delete a domain",
      description = "Delete a domain")
  public Uni<GraphDelta> deleteDomain(@PathParam("id") UUID id) {
    return Uni.createFrom().item(graphService.deleteDomain(id));
  }

  @POST
  @Path("/node")
  @Operation(operationId = "createNode", summary = "Create a node", description = "Create a node")
  public Uni<GraphDelta> createNode(@Valid NodeCreate model) {
    return Uni.createFrom().item(graphService.createNode(model));
  }

  @PUT
  @Path("/node/{id}")
  @Operation(operationId = "updateNode", summary = "Update a node", description = "Update a node")
  public Uni<GraphDelta> updateNode(@PathParam("id") UUID id, @Valid NodeUpdate model) {
    return Uni.createFrom().item(graphService.updateNode(id, model));
  }

  @DELETE
  @Path("/node/{id}")
  @Operation(operationId = "deleteNode", summary = "Delete a node", description = "Delete a node")
  public Uni<GraphDelta> deleteNode(@PathParam("id") UUID id) {
    return Uni.createFrom().item(graphService.deleteNode(id));
  }

  @POST
  @Path("/relation")
  @Operation(
      operationId = "createRelation",
      summary = "Create a relation",
      description = "Create a relation")
  public Uni<GraphDelta> createRelation(@Valid RelationCreate model) {
    return Uni.createFrom().item(graphService.createRelation(model));
  }

  @PUT
  @Path("/relation/{id}")
  @Operation(
      operationId = "updateRelation",
      summary = "Update a relation",
      description = "Update a relation")
  public Uni<GraphDelta> updateRelation(@PathParam("id") UUID id, @Valid RelationUpdate model) {
    return Uni.createFrom().item(graphService.updateRelation(id, model));
  }

  @DELETE
  @Path("/relation/{id}")
  @Operation(
      operationId = "deleteRelation",
      summary = "Delete a relation",
      description = "Delete a relation")
  public Uni<GraphDelta> deleteRelation(@PathParam("id") UUID id) {
    return Uni.createFrom().item(graphService.deleteRelation(id));
  }

  @GET
  @Path("/domain/{domainId}/mapping")
  @Operation(
      operationId = "fetchDomainMapping",
      summary = "Fetch a domain mapping",
      description = "Fetch a domain mapping")
  public Uni<Map<String, String>> createJsonModel(@PathParam("domainId") UUID id) {
    return graphService.createJsonModel(id);
  }

  @GET
  @Path("/domain/{domainId}/keys")
  @Operation(
      operationId = "fetchDomainKeys",
      summary = "Fetch a domain keys",
      description = "Fetch a domain keys")
  public Uni<List<String>> createJsonModelKeys(@PathParam("domainId") UUID id) {
    return graphService.createJsonModelKeys(id);
  }
}
