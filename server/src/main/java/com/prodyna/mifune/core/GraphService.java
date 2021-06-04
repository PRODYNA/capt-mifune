package com.prodyna.mifune.core;

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

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
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
import com.prodyna.mifune.domain.Relation;
import com.prodyna.mifune.domain.RelationCreate;
import com.prodyna.mifune.domain.RelationUpdate;
import io.quarkus.runtime.StartupEvent;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.event.Observes;
import javax.inject.Inject;
import javax.ws.rs.ClientErrorException;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.core.Response.Status;

import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;


@ApplicationScoped
public class GraphService {

  @Inject
  protected Logger log;

  public static final String GRAPH_JSON = "graph.json";

  private final Pattern COLOR_PATTERN = Pattern.compile("#[0-9,A-F]{6}");

  @ConfigProperty(name = "mifune.model.dir")
  protected String model;
  Graph graph = new Graph();

  void onStart(@Observes StartupEvent ev)  {

    var modelPath = Paths.get(model, GRAPH_JSON);
    if (modelPath.toFile().exists()) {
      log.infov("load {0}" , modelPath.toAbsolutePath());
      String json = null;
      try {
        json = Files.readString(modelPath);
        this.graph = new ObjectMapper().readerFor(Graph.class).readValue(json);
      } catch (IOException e) {
        log.error("fail to parse graph model",e);
      }
    }else{
      log.warnv("no graph model found at {0}",modelPath);
    }

  }


  public Graph graph() {
    return graph;
  }

  public void perist() throws IOException {
    var mapper = new ObjectMapper();
    var json = mapper.writeValueAsString(graph);
    Files.write(Path.of(model, GRAPH_JSON), Collections.singleton(json), StandardCharsets.UTF_8);
  }

  public Domain fetchDomain(UUID id) {
    return graph.getDomains().stream()
        .filter(d -> d.getId().equals(id)).findFirst()
        .orElseThrow(NotFoundException::new);
  }

  public List<Domain> fetchDomains() {
    return graph.getDomains().stream()
        .peek(d -> d.setModelValid(validateDomainModel(d)))
        .peek(d -> d.setMappingValid(validateDomainMapping(d)))
        .collect(Collectors.toList());
  }

  private boolean validateDomainModel(Domain d) {
    //todo;
    return true;
  }

  private boolean validateDomainMapping(Domain d) {
    // todo: validate mapping again model, not only if mapping exist
    return Objects.nonNull(d.getColumnMapping())
           && Objects.nonNull(d.getFile());
  }


  public Domain createDomain(DomainCreate model) {
    var nameExit = graph.getDomains().stream().anyMatch(d -> d.getName().equals(model.name()));
    if (nameExit) {
      throw new ClientErrorException(Status.CONFLICT);
    }
    var domain = new Domain();
    domain.setId(UUID.randomUUID());
    domain.setName(model.name());
    domain.setRootNodeId(model.rootNodeId());

    domain.setFile(model.file());
    domain.setColumnMapping(model.columnMapping());
    graph.getDomains().add(domain);
    return domain;
  }

  public Domain updateDomain(UUID id, DomainUpdate model) {
    var domain = graph.getDomains().stream().filter(d -> d.getId().equals(id)).findAny()
        .orElseThrow(() -> new ClientErrorException(Status.NOT_FOUND));
    var nameExit = graph.getDomains().stream()
        .filter(not(d -> d.getId().equals(id)))
        .anyMatch(d -> d.getName().equals(model.name()));
    if (nameExit) {
      throw new ClientErrorException(Status.CONFLICT);
    }
    domain.setName(model.name());
    domain.setRootNodeId(model.rootNodeId());
    domain.setFile(model.file());
    domain.setColumnMapping(model.columnMapping());
    return domain;
  }

  public GraphDelta deleteDomain(UUID id) {
    var remove = graph.getDomains().removeIf(d -> d.getId().equals(id));
    if (!remove) {
      throw new ClientErrorException(Status.NOT_FOUND);
    }

    var graphDelta = new GraphDelta();
    graphDelta.getRemovedDomains().add(id);
    var removedNodeIds = graph.getNodes().stream()
        .filter(n -> n.getDomainIds().size() <= 1)
        .filter(n -> n.getDomainIds().contains(id))
        .map(Node::getId).collect(Collectors.toSet());

    removedNodeIds.stream().map(this::deleteNode)
        .forEach(gd -> {
          graphDelta.getRemovedNodes().addAll(gd.getRemovedNodes());
          graphDelta.getRemovedRelations().addAll(gd.getRemovedRelations());
        });

    graphDelta.setRemovedNodes(removedNodeIds);

    return graphDelta;
  }

  public Node createNode(NodeCreate model) {
    checkDominIds(model.domainIds());
    var labelExist = graph.getNodes().stream().anyMatch(n -> n.getLabel().equals(model.label()));
    if (labelExist) {
      throw new ClientErrorException(Status.CONFLICT);
    }
    var node = new Node();
    var uuid = UUID.randomUUID();
    node.setId(uuid);
    node.setLabel(model.label());
    node.setProperties(model.properties());
    node.setDomainIds(model.domainIds());
    Optional.ofNullable(model.color())
        .filter(c -> COLOR_PATTERN.matcher(c).find())
        .ifPresentOrElse(node::setColor,
            () -> node.setColor(colorFromUUID(uuid))
        );

    graph.getNodes().add(node);
    return node;
  }

  String colorFromUUID(UUID uuid) {
    var s = uuid.toString();

    return "#" + s.substring(s.length() - 6);
  }

  public GraphDelta updateNode(UUID id, NodeUpdate model) {
    var graphDelta = new GraphDelta();
    checkDominIds(model.domainIds());
    var node = graph.getNodes().stream()
        .filter(n -> n.getId().equals(id))
        .findAny()
        .orElseThrow(() -> new ClientErrorException(Status.NOT_FOUND));
    // check label
    graph.getNodes().stream()
        .filter(not(n -> n.getId().equals(id)))
        .filter(n -> n.getLabel().equals(model.label()))
        .findAny().ifPresent(n -> {
      throw new ClientErrorException(Status.CONFLICT);
    });

    node.setLabel(model.label());
    node.setDomainIds(model.domainIds());
    node.setColor(model.color());
    node.setProperties(model.properties());

    graphDelta.getChangedNodes().add(node);
    return graphDelta;
  }

  public GraphDelta deleteNode(UUID id) {
    var graphDelta = new GraphDelta();
    var removed = graph.getNodes().removeIf(n -> n.getId().equals(id));
    if (!removed) {
      throw new ClientErrorException(Status.NOT_FOUND);
    }
    graphDelta.getRemovedNodes().add(id);
    var removedRelationIds = graph.getRelations().stream()
        .filter(r -> r.getSourceId().equals(id) || r.getTargetId().equals(id))
        .map(Relation::getId).collect(Collectors.toSet());

    graph.getRelations().removeIf(r -> removedRelationIds.contains(r.getId()));

    graphDelta.setRemovedRelations(removedRelationIds);
    return graphDelta;
  }


  public GraphDelta createRelation(RelationCreate model) {
    var graphDelta = new GraphDelta();
    checkNodeIds(model.sourceId(), model.targetId());

    var rel = new Relation();
    rel.setId(UUID.randomUUID());
    rel.setSourceId(model.sourceId());
    rel.setTargetId(model.targetId());
    rel.setType(model.type());
    rel.setMultiple(model.multiple());
    rel.setPrimary(model.primary());
    rel.setProperties(model.properties());
    rel.setDomainIds(model.domainIds());
    rel.setColor(nodeById(rel.getSourceId()).getColor());

    graph.getRelations().add(rel);

    graphDelta.getChangedRelations().add(rel);

    return graphDelta;

  }

  public GraphDelta deleteRelation(UUID id) {
    var graphDelta = new GraphDelta();
    var removed = graph.getRelations().removeIf(r -> r.getId().equals(id));
    if (removed) {
      graphDelta.getRemovedRelations().add(id);
    } else {
      throw new ClientErrorException(Status.NOT_FOUND);
    }
    return graphDelta;
  }

  public GraphDelta updateRelation(UUID id, RelationUpdate model) {
    checkDominIds(model.domainIds());
    var graphDelta = new GraphDelta();
    var relation = graph.getRelations().stream()
        .filter(r -> r.getId().equals(id))
        .findAny()
        .orElseThrow(() -> new ClientErrorException(Status.NOT_FOUND));
    relation.setType(model.type());
    relation.setPrimary(model.primary());
    relation.setMultiple(model.multiple());
    relation.setProperties(model.properties());
    relation.setDomainIds(model.domainIds());
    graphDelta.getChangedRelations().add(relation);
    return graphDelta;
  }

  private void checkDominIds(Set<UUID> modelDomainIds) {
    var domainIds = graph.getDomains().stream().map(Domain::getId).collect(Collectors.toSet());
    var allDomainIdsExist = domainIds.containsAll(modelDomainIds);
    if (!allDomainIdsExist) {
      throw new ClientErrorException(Status.NOT_FOUND);
    }
  }

  public ObjectNode buildJsonModel(UUID id) {
    return new JsonBuilder(new GraphModel(graph), id)
        .getJson();
  }

  public void reset() {

    this.graph = new Graph();
  }

  private Node nodeById(UUID id) {
    return graph.getNodes().stream().filter(n -> n.getId().equals(id))
        .findFirst()
        .orElseThrow(() -> {
          throw new ClientErrorException(Status.NOT_FOUND);
        });
  }

  private void checkNodeIds(UUID... nodeIds) {
    var existingNodeIds = graph.getNodes().stream().map(Node::getId).collect(Collectors.toSet());
    if (!existingNodeIds.containsAll(Arrays.asList(nodeIds))) {
      throw new ClientErrorException(Status.NOT_FOUND);
    }
  }


}
