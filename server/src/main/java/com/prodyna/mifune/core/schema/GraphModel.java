package com.prodyna.mifune.core.schema;

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
