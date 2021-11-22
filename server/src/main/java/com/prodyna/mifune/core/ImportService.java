package com.prodyna.mifune.core;

/*-
 * #%L
 * prodyna-mifune-parent
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

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.opencsv.CSVReader;
import com.prodyna.json.converter.JsonTransformer;
import com.prodyna.mifune.core.json.JsonPathEditor;
import com.prodyna.mifune.core.schema.CypherIndexBuilder;
import com.prodyna.mifune.core.schema.CypherUpdateBuilder;
import com.prodyna.mifune.core.schema.GraphJsonBuilder;
import com.prodyna.mifune.core.schema.GraphModel;
import com.prodyna.mifune.domain.Domain;
import com.prodyna.mifune.domain.Graph;
import io.smallrye.mutiny.Multi;
import io.smallrye.mutiny.Uni;
import io.smallrye.mutiny.infrastructure.Infrastructure;
import io.smallrye.mutiny.subscription.Cancellable;
import io.vertx.mutiny.core.eventbus.EventBus;
import java.io.FileReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;
import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.ws.rs.BadRequestException;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;
import org.neo4j.driver.Driver;
import org.reactivestreams.FlowAdapters;

@ApplicationScoped
public class ImportService {

  private final Map<UUID, Cancellable> pipelineMap = new HashMap<>();

  @Inject protected Logger log;

  @Inject protected EventBus eventBus;

  @ConfigProperty(name = "mifune.upload.dir")
  protected String uploadDir;

  @Inject protected Driver driver;

  @Inject protected GraphService graphService;
  @Inject protected SourceService sourceService;

  // This Method should be split up into domain import and file import
  public Uni<String> runImport(UUID domainId) {

    if (pipelineMap.containsKey(domainId)) {
      log.info("import for domain is running");
      throw new BadRequestException();
    }

    log.debug("start import");

    var domain = graphService.fetchDomain(domainId);
    log.debugf("start import found domain %s", domain.getName());
    var graph = graphService.graph();

    return buildIndex(domainId, graph)
        .onItem()
        .transformToUni(v -> buildDomain(domain))
        .onItem()
        .invoke(
            () -> {
              Cancellable cancellable = startImportTask(domainId, domain, graph);

              pipelineMap.put(domainId, cancellable);
            })
        .map(x -> "OK");
  }

  private Cancellable startImportTask(UUID domainId, Domain domain, Graph graph) {
    GraphModel graphModel = new GraphModel(graph);
    var counter = new AtomicLong();
    ObjectNode jsonModel = new GraphJsonBuilder(graphModel, domainId, false).getJson();
    cleanJsonModel(domain, jsonModel);
    var importFile = Paths.get(uploadDir, domain.getFile());
    var cypher = new CypherUpdateBuilder(graphModel, domainId).getCypher();
    log.info(cypher);

    var publisher =
        Multi.createFrom()
            .items(fileContentStream(importFile))
            .emitOn(Infrastructure.getDefaultWorkerPool())
            .subscribe()
            .withSubscriber(FlowAdapters.toProcessor(new JsonTransformer(jsonModel, 100)));

    var session = driver.asyncSession();
    var importTask =
        Multi.createFrom()
            .publisher(publisher)
            .emitOn(Infrastructure.getDefaultWorkerPool())
            .onItem()
            .transformToUni(
                node -> {
                  var entry = new ObjectMapper().convertValue(node, Map.class);
                  var s = driver.asyncSession();
                  return Uni.createFrom()
                      .completionStage(
                          s.writeTransactionAsync(
                                  tx ->
                                      tx.runAsync(
                                          cypher,
                                          Map.of("model", entry, "domainId", domainId.toString())))
                              .exceptionally(
                                  e -> {
                                    log.error(
                                        " Failed item import in file: "
                                            + domain.getFile()
                                            + " on line "
                                            + counter.getAndIncrement()
                                            + " Message: "
                                            + e.getMessage());
                                    return null;
                                  })
                              .thenCompose(x1 -> session.closeAsync())
                              .thenApply(v -> counter.incrementAndGet()));
                });

    return importTask
        .withRequests(1)
        .concatenate()
        .subscribe()
        .with(
            s -> eventBus.publish(domainId.toString(), s),
            throwable -> {
              log.error("error in pipeline: " + throwable.getMessage());
              pipelineMap.remove(domainId);
            },
            () -> {
              pipelineMap.remove(domainId);
              log.info("import done ");
            });
  }

  private Uni<Void> buildDomain(Domain domain) {
    var session = driver.asyncSession();
    return Uni.createFrom()
        .completionStage(
            session
                .writeTransactionAsync(
                    tx ->
                        tx.runAsync(
                            "merge(d:Domain {id:$id}) set d.name = $name",
                            Map.of("id", domain.getId().toString(), "name", domain.getName())))
                .thenCompose(r -> session.closeAsync().toCompletableFuture()));
  }

  private Uni<Void> buildIndex(UUID domainId, Graph graph) {
    List<String> indexCyphers = new CypherIndexBuilder().getCypher(domainId, graph);
    return Multi.createFrom()
        .iterable(indexCyphers)
        .onItem()
        .transformToUni(
            indexCypher -> {
              var s = driver.asyncSession();
              return Uni.createFrom()
                  .completionStage(
                      s.writeTransactionAsync(tx -> tx.runAsync(indexCypher))
                          .exceptionally(
                              e -> {
                                log.error(" Failed creating index: " + e.getMessage());
                                return null;
                              })
                          .thenCompose(x1 -> s.closeAsync()));
            })
        .withRequests(1)
        .concatenate()
        .onItem()
        .ignoreAsUni();
  }

  private void cleanJsonModel(Domain domain, ObjectNode jsonModel) {
    JsonPathEditor jsonPathEditor = new JsonPathEditor();
    var header = sourceService.fileHeader(domain.getFile());
    List<String> existingPath = jsonPathEditor.extractFieldPaths(jsonModel);
    existingPath.forEach(
        path -> {
          var value = domain.getColumnMapping().get(path);
          if (domain.getColumnMapping().containsKey(path) && Objects.nonNull(value)) {
            jsonPathEditor.update(
                jsonModel,
                path,
                header.indexOf(value) + ":" + jsonPathEditor.value(jsonModel, path).asText());
          } else {
            jsonPathEditor.remove(jsonModel, path);
          }
        });

    log.debugf("JsonModel: %s", jsonModel);
  }

  private Stream<List<String>> fileContentStream(Path importFile) {
    try {
      return StreamSupport.stream(
              new CSVReader(new FileReader(importFile.toFile(), StandardCharsets.UTF_8))
                  .spliterator(),
              false)
          .skip(1)
          .map(Arrays::asList);
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }

  public Uni<String> stopImport(UUID domainId) {
    Optional.ofNullable(this.pipelineMap.remove(domainId)).ifPresent(Cancellable::cancel);
    return Uni.createFrom().item("done");
  }
}
