package com.prodyna.mifune.core.schema;

/*-
 * #%L
 * prodyna-mifune-server
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
		graph.getNodes().forEach(node -> {
			var nodeModel = nodes.computeIfAbsent(node.getId(), (x) -> new NodeModel());
			Optional.ofNullable(node.getDomainIds()).ifPresent(nodeModel.getDomainIds()::addAll);
			nodeModel.setId(node.getId());
			nodeModel.setLabel(node.getLabel());
			nodeModel.setProperties(node.getProperties());
		});

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
		return graph.getDomains().stream().filter(d -> d.getId().equals(domainId)).findFirst()
				.map(Domain::getRootNodeId).map(nodes::get).orElseThrow(NotFoundException::new);

	}
}
