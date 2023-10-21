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
import com.prodyna.mifune.core.data.StatisticService;
import com.prodyna.mifune.domain.GraphStatistics;
import com.prodyna.mifune.domain.ImportStatistic;
import com.prodyna.mifune.domain.Query;
import io.smallrye.mutiny.Multi;
import io.smallrye.mutiny.Uni;
import io.smallrye.mutiny.infrastructure.Infrastructure;
import io.vertx.mutiny.core.eventbus.EventBus;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@Path("/api/statistic")
@Tag(name = "statistic")
public class StatisticResource {

  private static final Logger LOG = LoggerFactory.getLogger(StatisticResource.class.getName());

  private final EventBus eventBus;

  private final ObjectMapper objectMapper;

  private final StatisticService statisticService;

  public StatisticResource(
      EventBus eventBus, ObjectMapper objectMapper, StatisticService statisticService) {
    this.eventBus = eventBus;
    this.objectMapper = objectMapper;
    this.statisticService = statisticService;
  }

  @POST
  @Operation(operationId = "query", summary = "Query the graph", description = "Query the graph")
  public Multi<Map<String, Object>> query(Query query) {
    return statisticService.query(query);
  }

  @GET
  @Path("/graph/stream")
  @Produces(MediaType.SERVER_SENT_EVENTS)
  @Operation(
      operationId = "graphStatistics",
      summary = "Graph statistics as stream",
      description = "Graph statistics")
  public Multi<GraphStatistics> graphStatistics() {
    return statisticService.graphStats();
  }

  @Tag(name = "domain")
  @GET
  @Path("/domain")
  @Operation(
      operationId = "domainStatistics",
      summary = "Domain statistics",
      description = "Domain statistics")
  public Uni<Map<UUID, Long>> countDomainRootNodes() {
    return statisticService.countDomainRootNodes();
  }

  @GET
  @Path("/domain/stream")
  @Produces(MediaType.SERVER_SENT_EVENTS)
  @Operation(
      operationId = "domainStatisticsStream",
      summary = "Domain statistics as stream",
      description = "Domain statistics")
  public Multi<Map<UUID, Long>> domainStatistics() {

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
