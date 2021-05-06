package com.prodyna.mifune.core.schema;

import com.prodyna.mifune.domain.Domain;
import com.prodyna.mifune.domain.Graph;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import javax.ws.rs.NotFoundException;

public class GraphModel {

  final Map<UUID, NodeModel> nodes = new HashMap<>();
  final Graph graph;

  public GraphModel(Graph graph) {
    this.graph = graph;
    graph.getNodes().forEach(
        node -> {
          var nodeModel = nodes.computeIfAbsent(node.getId(), (x) -> new NodeModel());
          Optional.ofNullable(node.getDomainIds())
              .ifPresent(nodeModel.getDomainIds()::addAll);
          nodeModel.setId(node.getId());
          nodeModel.setLabel(node.getLabel());
          nodeModel.setProperties(node.getProperties());
        }
    );

    graph.getRelations()

        .forEach(r -> {
          var relationModel = new RelationModel();
          var fromNode = nodes.get(r.getSourceId());
          relationModel.setFrom(fromNode);
          relationModel.setTo(nodes.get(r.getTargetId()));
          relationModel.setPrimary(r.isPrimary());
          relationModel.setType(r.getType());
          relationModel.setProperties(r.getProperties());
          relationModel.setMultiple(r.isMultiple());
          relationModel.setDomainIds(r.getDomainIds());
          fromNode.getRelations().add(relationModel);
        });
  }

  public NodeModel rootNode(UUID domainId) {
    return graph.getDomains().stream().filter(d -> d.getId().equals(domainId))
        .findFirst()
        .map(Domain::getRootNodeId)
        .map(nodes::get)
        .orElseThrow(NotFoundException::new);

  }
}
