package com.prodyna.mifune.api;

/*-
 * #%L
 * prodyna-mifune-parent
 * %%
 * Copyright (C) 2021 - 2022 PRODYNA SE
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

import com.fasterxml.jackson.databind.json.JsonMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.prodyna.mifune.core.DeletionService;
import com.prodyna.mifune.core.GraphService;
import com.prodyna.mifune.core.ImportService;
import com.prodyna.mifune.core.json.JsonPathEditor;
import com.prodyna.mifune.domain.*;
import io.smallrye.mutiny.Multi;
import io.smallrye.mutiny.Uni;
import io.smallrye.mutiny.infrastructure.Infrastructure;
import io.vertx.mutiny.core.eventbus.EventBus;
import java.io.IOException;
import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;
import javax.inject.Inject;
import javax.validation.Valid;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.jboss.logging.Logger;
import org.neo4j.driver.Driver;

@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@Path("/graph")
@Tag(name = "graph")
public class GraphResource {

  @Inject protected Logger log;

  @Inject protected GraphService graphService;
  @Inject protected ImportService importService;

  @Inject protected DeletionService deletionService;

  @Inject protected EventBus eventBus;

  @Inject Driver driver;

  @GET
  public Uni<Graph> loadGraph() {
    return Uni.createFrom().item(graphService.graph());
  }

  @GET
  @Path("/stats")
  @Produces(MediaType.SERVER_SENT_EVENTS)
  public Multi<GraphStatistics> graphStats() {
    return Multi.createFrom()
        .ticks()
        .every(Duration.ofSeconds(15))
        .onItem()
        .transformToUniAndConcatenate(
            t -> {
              var session = driver.asyncSession();
              var stats =
                  session
                      .readTransactionAsync(
                          tx ->
                              tx.runAsync(
                                      """
                             call {match (a) return count(a) as nodes}
                             call {match ()-[r]->() return count(r) as relations}
                             return nodes, relations
                             """)
                                  .thenCompose(
                                      fn ->
                                          fn.singleAsync()
                                              .thenApply(
                                                  r ->
                                                      new GraphStatistics(
                                                          r.get("nodes").asLong(),
                                                          r.get("relations").asLong()))))
                      .thenCompose(c -> session.closeAsync().thenApply(v -> c));
              return Uni.createFrom().completionStage(stats);
            });
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

  @GET
  @Path("/domain/fn/count")
  public Uni<Map<UUID, Long>> countDomainRootNodes() {
    var session = driver.asyncSession();
    var count =
        session
            .runAsync("match(d:Domain)--(x) return distinct d.id as id, count(x) as count")
            .thenCompose(
                r ->
                    r.listAsync(
                            x ->
                                new Object() {
                                  UUID id = UUID.fromString(x.get("id").asString());
                                  Long count = x.get("count").asLong();
                                })
                        .thenCompose(
                            l ->
                                session
                                    .closeAsync()
                                    .thenApply(
                                        x -> {
                                          var map =
                                              l.stream()
                                                  .collect(
                                                      Collectors.toMap(o -> o.id, o -> o.count));
                                          return map;
                                        })));

    return Uni.createFrom().completionStage(count);
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
  public Uni<GraphDelta> createNode(@Valid NodeCreate model) {
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
    ObjectNode jsonModel = graphService.buildDomainJsonModel(id);
    var mapping =
        Optional.ofNullable(graphService.fetchDomain(id).getColumnMapping()).orElse(Map.of());
    List<String> paths = new JsonPathEditor().extractFieldPaths(jsonModel);
    var hashmap =
        new TreeMap<String, String>(
            Comparator.comparing((String s) -> s.split("\\.").length).thenComparing(s -> s));
    paths.forEach(path -> hashmap.put(path, mapping.getOrDefault(path, null)));
    return Uni.createFrom().item(hashmap);
  }

  @GET
  @Path("/domain/{domainId}/import")
  public Uni<String> runImport(@PathParam("domainId") UUID domainId) {
    return importService.runImport(domainId);
  }

  @DELETE
  @Path("/domain/{domainId}/import")
  public Uni<String> stopImport(@PathParam("domainId") UUID domainId) {
    return importService.stopImport(domainId);
  }

  @DELETE
  @Path("/domain/{domainId}/clear")
  public Uni<String> clearDomain(@PathParam("domainId") UUID domainId) {
    deletionService.deleteDomainFromDatabase(domainId, graphService.graph());
    return Uni.createFrom().item("OK");
  }

  /**
   * This is used for the counter inside the table of pipelines
   *
   * @return
   */
  @GET
  @Path("domain/fn/statistics")
  @Produces(MediaType.SERVER_SENT_EVENTS)
  public Multi<Map<UUID, Long>> stats() {

    var count = this.countDomainRootNodes();
    var events =
        eventBus
            .localConsumer("import")
            .bodyStream()
            .toMulti()
            .emitOn(Infrastructure.getDefaultWorkerPool())
            .onOverflow()
            .buffer(20)
            .map(
                s -> {
                  try {
                    return new JsonMapper()
                        .createParser(s.toString())
                        .readValueAs(ImportStatistic.class);
                  } catch (IOException e) {
                    throw new RuntimeException(e);
                  }
                })
            .group()
            .intoLists()
            .of(3000, Duration.ofMillis(300))
            .map(
                l ->
                    l.stream()
                        .collect(
                            Collectors.toMap(
                                ImportStatistic::domainId, ImportStatistic::count, Long::max)));
    var defaults =
        graphService.fetchDomains().stream().collect(Collectors.toMap(Domain::getId, a -> 0L));
    return Multi.createBy()
        .concatenating()
        .streams(Uni.createFrom().item(defaults).toMulti(), count.toMulti(), events);
  }
}
