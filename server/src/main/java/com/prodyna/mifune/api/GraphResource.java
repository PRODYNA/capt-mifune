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

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.opencsv.CSVReader;
import com.prodyna.json.converter.JsonTransformer;
import com.prodyna.mifune.core.GraphService;
import com.prodyna.mifune.core.json.JsonPathEditor;
import com.prodyna.mifune.core.schema.CypherBuilder;
import com.prodyna.mifune.core.schema.GraphModel;
import com.prodyna.mifune.core.schema.JsonBuilder;
import com.prodyna.mifune.domain.Domain;
import com.prodyna.mifune.domain.DomainCreate;
import com.prodyna.mifune.domain.DomainUpdate;
import com.prodyna.mifune.domain.Graph;
import com.prodyna.mifune.domain.GraphDelta;
import com.prodyna.mifune.domain.Node;
import com.prodyna.mifune.domain.NodeCreate;
import com.prodyna.mifune.domain.NodeUpdate;
import com.prodyna.mifune.domain.RelationCreate;
import com.prodyna.mifune.domain.RelationUpdate;
import io.smallrye.mutiny.Multi;
import io.smallrye.mutiny.Uni;
import io.smallrye.mutiny.infrastructure.Infrastructure;
import io.vertx.mutiny.core.eventbus.EventBus;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Consumer;
import java.util.stream.StreamSupport;
import javax.inject.Inject;
import javax.validation.Valid;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.jboss.logging.Logger;
import org.neo4j.driver.Driver;
import org.reactivestreams.FlowAdapters;

@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@Path("/graph")
@Tag(name = "graph")
public class GraphResource {

  @Inject
  protected Logger log;
  @Inject
  protected GraphService graphService;
  @ConfigProperty(name = "mifune.upload.dir")
  protected String uploadDir;
  @ConfigProperty(name = "mifune.model.dir")
  protected String modelDir;
  @Inject
  protected Driver driver;

  @Inject
  EventBus eventBus;


  @GET
  public Uni<Graph> loadGraph() {
    return Uni.createFrom().item(graphService.graph());
  }

  @POST
  public Uni<Void> persistGraph() throws IOException {
    graphService.perist();
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
  public Multi<String> createJsonModel(@PathParam("domainId") UUID id) throws IOException {
    ObjectNode jsonModel = graphService.buildJsonModel(id);
    List<String> paths = new JsonPathEditor().extractFieldPaths(jsonModel);
    return Multi.createFrom().items(paths.stream());

  }

  @GET
  @Path("/domain/{domainId}/import")
//  @Produces(MediaType.SERVER_SENT_EVENTS)
  public Uni<String> runImport(@PathParam("domainId") UUID domainId) throws IOException {

    var counter = new AtomicInteger();
    var graph = graphService.graph();
    var domain = graph.getDomains().stream().filter(d -> d.getId().equals(domainId))
        .findFirst()
        .orElseThrow(NotFoundException::new);
    GraphModel graphModel = new GraphModel(graph);
    var cypher = new CypherBuilder(graphModel, domainId).getCypher();
    log.info(cypher);

    var mapper = new ObjectMapper();
    ObjectNode jsonModel = new JsonBuilder(graphModel, domainId).getJson();
    JsonPathEditor jsonPathEditor = new JsonPathEditor();
    domain.getColumnMapping().forEach(
            (key,value)-> jsonPathEditor.update(jsonModel,key,value)
    );

    var importFile = Paths.get(uploadDir, domain.getFile());

    var transformer = new JsonTransformer(jsonModel, 50);


    var multi = Multi.createFrom()
        .publisher(FlowAdapters.toProcessor(transformer))
        .emitOn(Infrastructure.getDefaultWorkerPool())
        .onItem()
        .transformToUni(node -> {
          var entry = new ObjectMapper().convertValue(node, Map.class);
          var session = driver.asyncSession();
          return Uni.createFrom().completionStage(
              session.writeTransactionAsync(tx -> tx.runAsync(cypher, Map.of("model", entry)))
                  .thenCompose(r -> session.closeAsync())
                  .thenApply(v -> counter.incrementAndGet())
          );

        })

        .withRequests(1)
        .concatenate()
        .subscribe()
        .with(
            s -> eventBus.publish(domainId.toString(),s),
            ()-> {
              //  todo: persist complete domain
              log.info("done");});

    Infrastructure.getDefaultExecutor().execute(() -> {
      pipeFile(importFile, transformer::accept);
      transformer.onComplete();

    });
    return Uni.createFrom().item("OK");

  }

  @GET
  @Path("/domain/{domainId}/stats")
  @Produces(MediaType.SERVER_SENT_EVENTS)
  public Multi<Object> stats(@PathParam("domainId") UUID domainId) throws IOException {
    return eventBus.localConsumer(domainId.toString()).bodyStream().toMulti();
  }

  public void pipeFile(java.nio.file.Path importFile, Consumer<? super List<String>> consumer) {
    try {
      StreamSupport
          .stream(new CSVReader(new FileReader(importFile.toFile())).spliterator(), false)
          .skip(1)
          .map(Arrays::asList)
          .forEach(consumer);
    } catch (FileNotFoundException e) {
      e.printStackTrace();
    }
  }


}
