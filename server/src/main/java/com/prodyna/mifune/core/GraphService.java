package com.prodyna.mifune.core;

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

import static java.util.function.Predicate.not;

import com.fasterxml.jackson.core.util.DefaultPrettyPrinter;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.prodyna.mifune.core.json.JsonPathEditor;
import com.prodyna.mifune.core.schema.GraphJsonBuilder;
import com.prodyna.mifune.core.schema.GraphModel;
import com.prodyna.mifune.domain.*;
import io.quarkus.runtime.StartupEvent;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
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

  @Inject protected Logger log;

  private static final Pattern COLOR_PATTERN = Pattern.compile("#[0-9,A-F]{6}");

  @ConfigProperty(name = "mifune.model.graph-file")
  protected String graphFile = "graph.json";

  @ConfigProperty(name = "mifune.model.dir")
  protected String model;

  @Inject protected SourceService sourceService;

  @Inject protected DeletionService deletionService;

  Graph graph = new Graph();

  void onStart(@Observes StartupEvent ev) {

    var modelPath = Paths.get(model, graphFile);
    if (modelPath.toFile().exists()) {
      log.infov("load {0}", modelPath.toAbsolutePath());

      try {
        var json = Files.readString(modelPath);
        this.graph = new ObjectMapper().readerFor(Graph.class).readValue(json);
      } catch (IOException e) {
        log.error("fail to parse graph model", e);
      }
    } else {
      log.warnv("no graph model found at {0}", modelPath.toAbsolutePath());
    }
  }

  public Graph graph() {
    graph.getDomains().forEach(this::validateDomainModel);
    graph.getDomains().forEach(this::validateDomainModel);
    return graph;
  }

  public void persist() throws IOException {
    var mapper = new ObjectMapper();
    var json = mapper.writer(new DefaultPrettyPrinter()).writeValueAsString(graph);
    System.out.println(json);
    Files.write(Path.of(model, graphFile), Collections.singleton(json), StandardCharsets.UTF_8);
  }

  public Domain fetchDomain(UUID id) {
    return graph.getDomains().stream()
        .filter(d -> d.getId().equals(id))
        .findFirst()
        .orElseThrow(NotFoundException::new);
  }

  public List<Domain> fetchDomains() {
    return graph.getDomains().stream()
        .peek(this::validateDomainModel)
        .peek(this::validateDomainMapping)
        .collect(Collectors.toList());
  }

  private void validateDomainModel(Domain d) {
    UUID startNode = d.getRootNodeId();
    Set<Node> allNodes =
        graph.getNodes().stream()
            .filter(n -> n.getDomainIds().contains(d.getId()))
            .collect(Collectors.toSet());
    Set<UUID> allNodeIds = allNodes.stream().map(Node::getId).collect(Collectors.toSet());
    Set<Relation> allRelations =
        graph.getRelations().stream()
            .filter(r -> r.getDomainIds().contains(d.getId()))
            .collect(Collectors.toSet());

    if (allRelations.size() <= 0 && allNodeIds.size() > 1) {
      d.setModelValid(false);
      return;
    }

    Set<UUID> subGraph = validate(startNode, allNodeIds, allRelations);
    d.setModelValid(subGraph.equals(allNodeIds));
  }

  private Set<UUID> validate(UUID startNode, Set<UUID> allNodes, Set<Relation> allRelations) {
    if (allRelations.size() <= 0) {
      Set<UUID> result = new HashSet<>();
      result.add(startNode);
      return result;
    }

    Set<UUID> copyAllNodes = new HashSet<>(allNodes);

    Set<Relation> usedRelations =
        allRelations.stream()
            .filter(r -> r.getSourceId().equals(startNode))
            .collect(Collectors.toSet());
    Set<UUID> reachableNodes =
        usedRelations.stream().map(Relation::getTargetId).collect(Collectors.toSet());
    allRelations.removeIf(usedRelations::contains);
    copyAllNodes.remove(startNode);
    Set<UUID> subGraph = new HashSet<>(reachableNodes);
    for (UUID node : reachableNodes) {
      subGraph.addAll(validate(node, copyAllNodes, allRelations));
    }
    return subGraph.equals(copyAllNodes) ? allNodes : subGraph;
  }

  private void validateDomainMapping(Domain d) {
    if (Objects.isNull(d.getFile()) || Objects.isNull(d.getColumnMapping())) {
      d.setMappingValid(false);
      return;
    }
    var header = sourceService.fileHeader(d.getFile());
    if (!header.containsAll(
        d.getColumnMapping().values().stream()
            .filter(Objects::nonNull)
            .collect(Collectors.toSet()))) {
      log.debug("validate failed, header not exist in source file");
      d.setMappingValid(false);
      return;
    }

    Map<String, String> mapping = d.getColumnMapping();
    ObjectNode jsonModel = new GraphJsonBuilder(new GraphModel(graph), d.getId(), true).getJson();
    List<String> paths = new JsonPathEditor().extractFieldPaths(jsonModel);
    d.setMappingValid(mapping.keySet().containsAll(paths));
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
    validateDomainModel(domain);
    validateDomainMapping(domain);
    return domain;
  }

  public Domain updateDomain(UUID id, DomainUpdate model) {
    var domain =
        graph.getDomains().stream()
            .filter(d -> d.getId().equals(id))
            .findAny()
            .orElseThrow(() -> new ClientErrorException(Status.NOT_FOUND));
    var nameExit =
        graph.getDomains().stream()
            .filter(not(d -> d.getId().equals(id)))
            .anyMatch(d -> d.getName().equals(model.name()));
    if (nameExit) {
      throw new ClientErrorException(Status.CONFLICT);
    }
    var mapping =
        Optional.ofNullable(model.columnMapping()).orElse(Map.of()).entrySet().stream()
            .filter(e -> Objects.nonNull(e.getValue()))
            .filter(not(e -> e.getValue().isBlank()))
            .filter(not(e -> e.getKey().isBlank()))
            .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

    domain.setName(model.name());
    domain.setRootNodeId(model.rootNodeId());
    domain.setFile(model.file());
    domain.setColumnMapping(mapping);
    validateDomainModel(domain);
    validateDomainMapping(domain);
    return domain;
  }

  /**
   * This method generates a Graph Delta, to tell the Frontend which nodes are to be deleted. In
   * addition, it calls the Deletion Service, to delete the nodes, related to the deleted domain
   * inside Neo4J.
   *
   * @param id of the domain to be deleted
   * @return GraphDelta to tell Fronted which nodes and relations are to be deleted
   */
  public GraphDelta deleteDomain(UUID id) {
    // delete domain from Database
    deletionService.deleteDomainFromDatabase(id, graph);

    var remove = graph.getDomains().removeIf(d -> d.getId().equals(id));
    if (!remove) {
      throw new ClientErrorException(Status.NOT_FOUND);
    }

    var changedDomains = new HashSet<Domain>();
    var removedNodes = new HashSet<UUID>();
    var changedNodes = new HashSet<Node>();
    var removedRelations = new HashSet<UUID>();
    var changedRelations = new HashSet<Relation>();

    graph.getNodes().stream()
        .filter(n -> n.getDomainIds().size() <= 1)
        .filter(n -> n.getDomainIds().contains(id))
        .map(Node::getId)
        .forEach(removedNodes::add);

    graph.getNodes().stream()
        .filter(n -> n.getDomainIds().contains(id))
        .peek(d -> d.getDomainIds().remove(id))
        .forEach(changedNodes::add);

    graph.getRelations().stream()
        .filter(n -> n.getDomainIds().size() <= 1)
        .filter(n -> n.getDomainIds().contains(id))
        .peek(d -> d.getDomainIds().remove(id))
        .map(Relation::getId)
        .forEach(removedRelations::add);

    graph.getRelations().stream()
        .filter(n -> n.getDomainIds().contains(id))
        .peek(d -> d.getDomainIds().remove(id))
        .forEach(changedRelations::add);

    removedNodes.stream()
        .map(this::deleteNode)
        .forEach(
            gd -> {
              changedDomains.addAll(gd.changedDomains());
              changedNodes.addAll(gd.changedNodes());
              changedRelations.addAll(gd.changedRelations());
              removedRelations.addAll(gd.removedRelations());
            });

    removedRelations.stream()
        .filter(relId -> graph.getRelations().stream().map(Relation::getId).anyMatch(relId::equals))
        .map(this::deleteRelation)
        .forEach(
            gd -> {
              removedNodes.addAll(gd.removedNodes());
              changedDomains.addAll(gd.changedDomains());
              changedNodes.addAll(gd.changedNodes());
              changedRelations.addAll(gd.changedRelations());
              removedRelations.addAll(gd.removedRelations());
            });

    changedNodes.removeIf(node -> removedNodes.contains(node.getId()));
    changedRelations.removeIf(relation -> removedRelations.contains(relation.getId()));
    changedDomains.removeIf(r -> id.equals(r.getId()));

    return new GraphDelta(
        id,
        changedDomains,
        Set.of(id),
        changedNodes,
        removedNodes,
        changedRelations,
        removedRelations);
  }

  public GraphDelta createNode(NodeCreate model) {
    checkDomainIds(model.domainIds());
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
        .ifPresentOrElse(node::setColor, () -> node.setColor(colorFromUUID(uuid)));

    graph.getNodes().add(node);
    return new GraphDelta(
        node.getId(),
        domainsFromNode(model.domainIds()),
        Set.of(),
        Set.of(node),
        Set.of(),
        Set.of(),
        Set.of());
  }

  String colorFromUUID(UUID uuid) {
    var s = uuid.toString();

    return "#" + s.substring(s.length() - 6);
  }

  public GraphDelta updateNode(UUID id, NodeUpdate model) {
    var changedDomains = new HashSet<>(model.domainIds());

    checkDomainIds(model.domainIds());
    var node = nodeById(id);
    changedDomains.addAll(node.getDomainIds());
    checkForIfLabelExist(id, model);

    node.setLabel(model.label());
    node.setDomainIds(model.domainIds());
    node.setColor(model.color());
    node.setProperties(model.properties());

    return new GraphDelta(
        node.getId(),
        domainsFromNode(changedDomains),
        Set.of(),
        Set.of(node),
        Set.of(),
        Set.of(),
        Set.of());
  }

  private void checkForIfLabelExist(UUID id, NodeUpdate model) {
    graph.getNodes().stream()
        .filter(not(n -> n.getId().equals(id)))
        .filter(n -> n.getLabel().equals(model.label()))
        .findAny()
        .ifPresent(
            n -> {
              throw new ClientErrorException(Status.CONFLICT);
            });
  }

  public GraphDelta deleteNode(UUID id) {

    var node = nodeById(id);
    var changedDomains = new HashSet<>(domainsFromNode(node.getDomainIds()));
    var changedNodes = new HashSet<Node>();
    var removedRelationIds = new HashSet<UUID>();

    relationConnectedWithNode(id).stream()
        .map(Relation::getId)
        .map(this::deleteRelation)
        .forEach(
            gd -> {
              changedDomains.addAll(gd.changedDomains());
              changedNodes.addAll(gd.changedNodes());
              removedRelationIds.addAll(gd.removedRelations());
            });

    graph.getNodes().remove(node);
    changedNodes.removeIf(n -> n.getId().equals(id));

    return new GraphDelta(
        node.getId(),
        changedDomains,
        Set.of(),
        changedNodes,
        Set.of(node.getId()),
        Set.of(),
        removedRelationIds);
  }

  private Set<Domain> domainsFromNode(Set<UUID> domainIds) {
    return graph().getDomains().stream()
        .filter(d -> domainIds.contains(d.getId()))
        .collect(Collectors.toSet());
  }

  private Set<Relation> relationConnectedWithNode(UUID id) {
    return graph.getRelations().stream()
        .filter(r -> r.getSourceId().equals(id) || r.getTargetId().equals(id))
        .collect(Collectors.toSet());
  }

  public GraphDelta createRelation(RelationCreate model) {

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

    Node node = null;
    if (model.domainIds().size() == 1) {
      node = nodeById(model.targetId());
      node.getDomainIds().addAll(model.domainIds());
    }

    graph.getRelations().add(rel);

    return new GraphDelta(
        rel.getId(),
        domainsFromNode(rel.getDomainIds()),
        Set.of(),
        Optional.ofNullable(node).map(Set::of).orElse(Set.of()),
        Set.of(),
        Set.of(rel),
        Set.of());
  }

  public GraphDelta deleteRelation(UUID id) {

    var removed =
        graph.getRelations().stream()
            .filter(r -> r.getId().equals(id))
            .findFirst()
            .orElseThrow(
                () -> {
                  throw new ClientErrorException(Status.NOT_FOUND);
                });
    graph.getRelations().remove(removed);

    return new GraphDelta(
        id,
        domainsFromNode(removed.getDomainIds()),
        Set.of(),
        graph.getNodes().stream()
            .filter(n -> n.getId().equals(removed.getTargetId()))
            .findFirst()
            .map(Set::of)
            .orElse(Set.of()),
        Set.of(),
        Set.of(),
        Set.of(removed.getId()));
  }

  public GraphDelta updateRelation(UUID id, RelationUpdate model) {
    var changeDomainIds = new HashSet<>(model.domainIds());
    checkDomainIds(model.domainIds());
    var relation = relationById(id);
    changeDomainIds.addAll(relation.getDomainIds());
    relation.setType(model.type());
    relation.setPrimary(model.primary());
    relation.setMultiple(model.multiple());
    relation.setProperties(model.properties());
    relation.setDomainIds(model.domainIds());
    return new GraphDelta(
        id,
        domainsFromNode(changeDomainIds),
        Set.of(),
        Set.of(),
        Set.of(),
        Set.of(relation),
        Set.of());
  }

  private Relation relationById(UUID id) {
    return graph.getRelations().stream()
        .filter(r -> r.getId().equals(id))
        .findAny()
        .orElseThrow(() -> new ClientErrorException(Status.NOT_FOUND));
  }

  private void checkDomainIds(Set<UUID> modelDomainIds) {
    var domainIds = graph.getDomains().stream().map(Domain::getId).collect(Collectors.toSet());
    var allDomainIdsExist = domainIds.containsAll(modelDomainIds);
    if (!allDomainIdsExist) {
      throw new ClientErrorException(Status.NOT_FOUND);
    }
  }

  public ObjectNode buildDomainJsonModel(UUID id) {
    var graphModel = new GraphModel(graph);
    return new GraphJsonBuilder(graphModel, id, false).getJson();
  }

  public void reset() {
    this.graph = new Graph();
  }

  private Node nodeById(UUID id) {
    return graph.getNodes().stream()
        .filter(n -> n.getId().equals(id))
        .findFirst()
        .orElseThrow(
            () -> {
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
