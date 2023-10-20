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

import com.fasterxml.jackson.databind.ObjectMapper;
import com.prodyna.mifune.core.data.DeletionService;
import com.prodyna.mifune.core.data.ImportService;
import com.prodyna.mifune.core.data.StatisticService;
import com.prodyna.mifune.core.graph.GraphService;
import com.prodyna.mifune.domain.*;
import io.smallrye.mutiny.Multi;
import io.smallrye.mutiny.Uni;
import io.smallrye.mutiny.infrastructure.Infrastructure;
import io.vertx.mutiny.core.eventbus.EventBus;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import java.io.IOException;
import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@Path("/api/graph")
@Tag(name = "graph")
public class GraphResource {

  private static final Logger LOG = LoggerFactory.getLogger(GraphResource.class.getName());

  @Inject protected GraphService graphService;
  @Inject protected ImportService importService;
  @Inject protected DeletionService deletionService;
  @Inject protected EventBus eventBus;

  @Inject protected StatisticService statisticService;

  @Inject ObjectMapper objectMapper;

  @GET
  public Uni<Graph> loadGraph() {
    return Uni.createFrom().item(graphService.graph());
  }

  @GET
  @Path("/stats")
  @Produces(MediaType.SERVER_SENT_EVENTS)
  public Multi<GraphStatistics> graphStats() {
    return statisticService.graphStats();
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

  @Tag(name = "domain")
  @GET
  @Path("/domains")
  public Multi<Domain> fetchDomains() {
    return Multi.createFrom().iterable(graphService.fetchDomains());
  }

  @Tag(name = "domain")
  @POST
  @Path("/domain")
  public Uni<Domain> createDomain(@Valid DomainCreate model) {
    return Uni.createFrom().item(graphService.createDomain(model));
  }

  @Tag(name = "domain")
  @GET
  @Path("/domain/{id}")
  public Uni<Domain> fetchDomain(@PathParam("id") UUID id) {
    return Uni.createFrom().item(graphService.fetchDomain(id));
  }

  @Tag(name = "domain")
  @GET
  @Path("/domain/fn/count")
  public Uni<Map<UUID, Long>> countDomainRootNodes() {
    return statisticService.countDomainRootNodes();
  }

  @Tag(name = "domain")
  @PUT
  @Path("/domain/{id}")
  public Uni<Domain> updateDomain(@PathParam("id") UUID id, @Valid DomainUpdate model) {
    return Uni.createFrom().item(graphService.updateDomain(id, model));
  }

  @Tag(name = "domain")
  @DELETE
  @Path("/domain/{id}")
  public Uni<GraphDelta> deleteDomain(@PathParam("id") UUID id) {
    return Uni.createFrom().item(graphService.deleteDomain(id));
  }

  @Tag(name = "node")
  @POST
  @Path("/node")
  public Uni<GraphDelta> createNode(@Valid NodeCreate model) {
    return Uni.createFrom().item(graphService.createNode(model));
  }

  @Tag(name = "node")
  @PUT
  @Path("/node/{id}")
  public Uni<GraphDelta> updateNode(@PathParam("id") UUID id, @Valid NodeUpdate model) {
    return Uni.createFrom().item(graphService.updateNode(id, model));
  }

  @Tag(name = "node")
  @DELETE
  @Path("/node/{id}")
  public Uni<GraphDelta> deleteNode(@PathParam("id") UUID id) {
    return Uni.createFrom().item(graphService.deleteNode(id));
  }

  @Tag(name = "relation")
  @POST
  @Path("/relation")
  public Uni<GraphDelta> createRelation(@Valid RelationCreate model) {
    return Uni.createFrom().item(graphService.createRelation(model));
  }

  @Tag(name = "relation")
  @PUT
  @Path("/relation/{id}")
  public Uni<GraphDelta> updateRelation(@PathParam("id") UUID id, @Valid RelationUpdate model) {
    return Uni.createFrom().item(graphService.updateRelation(id, model));
  }

  @Tag(name = "relation")
  @DELETE
  @Path("/relation/{id}")
  public Uni<GraphDelta> deleteRelation(@PathParam("id") UUID id) {
    return Uni.createFrom().item(graphService.deleteRelation(id));
  }

  @GET
  @Path("/domain/{domainId}/mapping")
  public Uni<Map<String, String>> createJsonModel(@PathParam("domainId") UUID id) {
    return graphService.createJsonModel(id);
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

    var events =
        eventBus
            .localConsumer("import")
            .bodyStream()
            .toMulti()
            .emitOn(Infrastructure.getDefaultWorkerPool())
            .onOverflow()
            .buffer(1000)
            .map(
                s -> {
                  try {
                    return objectMapper.reader().readValue(s.toString(), ImportStatistic.class);
                  } catch (IOException e) {
                    throw new RuntimeException(e);
                  }
                })
            .group()
            .intoLists()
            .of(5000, Duration.ofMillis(300))
            .map(
                l ->
                    l.stream()
                        .collect(
                            Collectors.toMap(
                                ImportStatistic::domainId, ImportStatistic::count, Long::max)))
            .filter(m -> !m.isEmpty());

    Uni<Map<UUID, Long>> countDomainRootNodes = countDomainRootNodes();
    var fallback = Multi.createFrom().uni(countDomainRootNodes);

    return Multi.createBy()
        .concatenating()
        .streams(fallback, events)
        .ifNoItem()
        .after(Duration.ofSeconds(5))
        .recoverWithMulti(fallback)
        .map(
            m -> {
              LOG.info("stats {}", m);
              return m;
            });
  }
}
