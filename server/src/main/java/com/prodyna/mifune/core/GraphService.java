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
import com.prodyna.mifune.core.json.JsonPathEditor;
import com.prodyna.mifune.core.schema.GraphModel;
import com.prodyna.mifune.core.schema.JsonBuilder;
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

	@Inject
	protected Logger log;

	private static final Pattern COLOR_PATTERN = Pattern.compile("#[0-9,A-F]{6}");

	@ConfigProperty(name = "mifune.model.graph-file")
	protected String graphFile = "graph.json";

	@ConfigProperty(name = "mifune.model.dir")
	protected String model;

	@Inject
	protected SourceService sourceService;

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
			log.warnv("no graph model found at {0}", modelPath);
		}

	}

	public Graph graph() {
		graph.getDomains().forEach(this::validateDomainModel);
		graph.getDomains().forEach(this::validateDomainModel);
		return graph;
	}

	public void persist() throws IOException {
		var mapper = new ObjectMapper();
		var json = mapper.writeValueAsString(graph);
		Files.write(Path.of(model, graphFile), Collections.singleton(json), StandardCharsets.UTF_8);
	}

	public Domain fetchDomain(UUID id) {
		return graph.getDomains().stream().filter(d -> d.getId().equals(id)).findFirst()
				.orElseThrow(NotFoundException::new);
	}

	public List<Domain> fetchDomains() {
		return graph.getDomains().stream().peek(this::validateDomainModel).peek(this::validateDomainMapping)
				.collect(Collectors.toList());
	}

	private void validateDomainModel(Domain d) {
		UUID startNode = d.getRootNodeId();
		Set<Node> allNodes = graph.getNodes().stream().filter(n -> n.getDomainIds().contains(d.getId()))
				.collect(Collectors.toSet());
		Set<UUID> allNodeIds = allNodes.stream().map(Node::getId).collect(Collectors.toSet());
		Set<Relation> allRelations = graph.getRelations().stream().filter(r -> r.getDomainIds().contains(d.getId()))
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
			Set<UUID> result = new HashSet<UUID>();
			result.add(startNode);
			return result;
		}

		Set<UUID> copyAllNodes = new HashSet<UUID>(allNodes);

		Set<Relation> usedRelations = allRelations.stream().filter(r -> r.getSourceId().equals(startNode))
				.collect(Collectors.toSet());
		Set<UUID> reachableNodes = usedRelations.stream().map(Relation::getTargetId).collect(Collectors.toSet());
		allRelations.removeIf(usedRelations::contains);
		copyAllNodes.remove(startNode);
		Set<UUID> subGraph = new HashSet<UUID>(reachableNodes);
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
				d.getColumnMapping().values().stream().filter(Objects::nonNull).collect(Collectors.toSet()))) {
			log.debug("validate failed, header not exist in source file");
			d.setMappingValid(false);
			return;
		}

		Map<String, String> mapping = d.getColumnMapping();
		ObjectNode jsonModel = new JsonBuilder(new GraphModel(graph), d.getId(), true).getJson();
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
		var domain = graph.getDomains().stream().filter(d -> d.getId().equals(id)).findAny()
				.orElseThrow(() -> new ClientErrorException(Status.NOT_FOUND));
		var nameExit = graph.getDomains().stream().filter(not(d -> d.getId().equals(id)))
				.anyMatch(d -> d.getName().equals(model.name()));
		if (nameExit) {
			throw new ClientErrorException(Status.CONFLICT);
		}
		var mapping = Optional.ofNullable(model.columnMapping()).orElse(Map.of()).entrySet().stream()
				.filter(e -> Objects.nonNull(e.getValue())).filter(not(e -> e.getValue().isBlank()))
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

	public GraphDelta deleteDomain(UUID id) {
		var remove = graph.getDomains().removeIf(d -> d.getId().equals(id));
		if (!remove) {
			throw new ClientErrorException(Status.NOT_FOUND);
		}

		var graphDelta = new GraphDelta();
		graphDelta.getRemovedDomains().add(id);
		var removedNodeIds = graph.getNodes().stream().filter(n -> n.getDomainIds().size() <= 1)
				.filter(n -> n.getDomainIds().contains(id)).map(Node::getId).collect(Collectors.toSet());

		var changedNodes = graph.getNodes().stream().filter(n -> n.getDomainIds().contains(id))
				.peek(d -> d.getDomainIds().remove(id)).collect(Collectors.toSet());

		var removedRelations = graph.getRelations().stream().filter(n -> n.getDomainIds().size() <= 1)
				.filter(n -> n.getDomainIds().contains(id)).peek(d -> d.getDomainIds().remove(id))
				.collect(Collectors.toSet());

		graph.getRelations().removeAll(removedRelations);
		removedRelations.stream().map(Relation::getId).forEach(graphDelta.getRemovedRelations()::add);

		var changedRelations = graph.getRelations().stream().filter(n -> n.getDomainIds().contains(id))
				.peek(d -> d.getDomainIds().remove(id)).collect(Collectors.toSet());

		removedNodeIds.stream().map(this::deleteNode).forEach(gd -> {
			graphDelta.getChangedRelations().addAll(gd.getChangedRelations());
			graphDelta.getChangedDomains().addAll(gd.getChangedDomains());
			graphDelta.getRemovedNodes().addAll(gd.getRemovedNodes());
			graphDelta.getRemovedRelations().addAll(gd.getRemovedRelations());
		});

		graphDelta.getChangedRelations().addAll(changedRelations);
		graphDelta.getChangedNodes().addAll(changedNodes);
		graphDelta.getRemovedNodes().addAll(removedNodeIds);
		graphDelta.getChangedNodes().removeIf(d -> graphDelta.getRemovedNodes().contains(d.getId()));
		graphDelta.getChangedRelations().removeIf(d -> graphDelta.getRemovedRelations().contains(d.getId()));

		return graphDelta;
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
		Optional.ofNullable(model.color()).filter(c -> COLOR_PATTERN.matcher(c).find()).ifPresentOrElse(node::setColor,
				() -> node.setColor(colorFromUUID(uuid)));

		graph.getNodes().add(node);
		var graphDelta = new GraphDelta();
		graphDelta.setTrigger(node.getId());
		graphDelta.getChangedNodes().add(node);
		graphDelta.setChangedDomains(graph().getDomains().stream().filter(d -> model.domainIds().contains(d.getId()))
				.collect(Collectors.toSet()));
		return graphDelta;
	}

	String colorFromUUID(UUID uuid) {
		var s = uuid.toString();

		return "#" + s.substring(s.length() - 6);
	}

	public GraphDelta updateNode(UUID id, NodeUpdate model) {
		var changedDomains = new HashSet<UUID>(model.domainIds());
		var graphDelta = new GraphDelta();
		checkDomainIds(model.domainIds());
		var node = nodeById(id);
		changedDomains.addAll(node.getDomainIds());
		checkForIfLabelExist(id, model);

		node.setLabel(model.label());
		node.setDomainIds(model.domainIds());
		node.setColor(model.color());
		node.setProperties(model.properties());

		graphDelta.getChangedNodes().add(node);
		graphDelta.setChangedDomains(graph().getDomains().stream().filter(d -> changedDomains.contains(d.getId()))
				.collect(Collectors.toSet()));

		return graphDelta;
	}

	private void checkForIfLabelExist(UUID id, NodeUpdate model) {
		graph.getNodes().stream().filter(not(n -> n.getId().equals(id))).filter(n -> n.getLabel().equals(model.label()))
				.findAny().ifPresent(n -> {
					throw new ClientErrorException(Status.CONFLICT);
				});
	}

	public GraphDelta deleteNode(UUID id) {
		var graphDelta = new GraphDelta();
		var node = graph.getNodes().stream().filter(n -> n.getId().equals(id)).findFirst().orElseThrow(() -> {
			throw new ClientErrorException(Status.NOT_FOUND);
		});
		graph.getNodes().remove(node);

		graphDelta.getRemovedNodes().add(id);
		var removedRelationIds = graph.getRelations().stream()
				.filter(r -> r.getSourceId().equals(id) || r.getTargetId().equals(id)).map(Relation::getId)
				.collect(Collectors.toSet());

		graph.getRelations().removeIf(r -> removedRelationIds.contains(r.getId()));

		graphDelta.setRemovedRelations(removedRelationIds);
		graphDelta.setChangedDomains(graph().getDomains().stream().filter(d -> node.getDomainIds().contains(d.getId()))
				.collect(Collectors.toSet()));
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

		if (model.domainIds().size() == 1) {
			Node node = nodeById(model.targetId());
			node.getDomainIds().addAll(model.domainIds());
			graphDelta.getChangedNodes().add(node);
		}

		graph.getRelations().add(rel);

		graphDelta.getChangedRelations().add(rel);
		graphDelta.setChangedDomains(graph().getDomains().stream().filter(d -> rel.getDomainIds().contains(d.getId()))
				.collect(Collectors.toSet()));

		return graphDelta;

	}

	public GraphDelta deleteRelation(UUID id) {
		var graphDelta = new GraphDelta();
		var removed = graph.getRelations().stream().filter(r -> r.getId().equals(id)).findFirst().orElseThrow(() -> {
			throw new ClientErrorException(Status.NOT_FOUND);
		});
		graphDelta.getRemovedRelations().add(removed.getId());

		graphDelta.setChangedDomains(graph().getDomains().stream()
				.filter(d -> removed.getDomainIds().contains(d.getId())).collect(Collectors.toSet()));
		return graphDelta;
	}

	public GraphDelta updateRelation(UUID id, RelationUpdate model) {
		var changeDomainIds = new HashSet<UUID>(model.domainIds());
		checkDomainIds(model.domainIds());
		var graphDelta = new GraphDelta();
		var relation = relationById(id);
		changeDomainIds.addAll(relation.getDomainIds());
		relation.setType(model.type());
		relation.setPrimary(model.primary());
		relation.setMultiple(model.multiple());
		relation.setProperties(model.properties());
		relation.setDomainIds(model.domainIds());
		graphDelta.getChangedRelations().add(relation);
		graphDelta.setChangedDomains(graph().getDomains().stream().filter(d -> changeDomainIds.contains(d.getId()))
				.collect(Collectors.toSet()));
		return graphDelta;
	}

	private Relation relationById(UUID id) {
		return graph.getRelations().stream().filter(r -> r.getId().equals(id)).findAny()
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
		var json = new JsonBuilder(graphModel, id, false).getJson();
		return json;
	}

	public void reset() {
		this.graph = new Graph();
	}

	private Node nodeById(UUID id) {
		return graph.getNodes().stream().filter(n -> n.getId().equals(id)).findFirst().orElseThrow(() -> {
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
