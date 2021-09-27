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

import com.prodyna.mifune.domain.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.ws.rs.core.Response;
import org.jboss.logging.Logger;
import org.neo4j.driver.Driver;
import org.neo4j.driver.async.ResultCursor;

@ApplicationScoped
public class DeletionService {
	@Inject
	protected Logger log;

	@Inject
	protected Driver driver;

	public void deleteDomainFromDatabase(UUID domainId, Graph actualGraph) {
		// get all node labels connected to domain id
		List<Node> nodesToBeDeleted = actualGraph.getNodes().stream().filter(n -> n.getDomainIds().contains(domainId))
				.filter(n -> n.getDomainIds().size() <= 1).collect(Collectors.toList());
		List<Relation> relationsToBeDeleted = actualGraph.getRelations().stream()
				.filter(n -> n.getDomainIds().contains(domainId)).filter(n -> n.getDomainIds().size() <= 1)
				.collect(Collectors.toList());

		// build cypher to delete these nodes with all corresponding relations detach
		// delete
		for (var rel : relationsToBeDeleted) {
			var cypher = String.format("MATCH(a:%s)-[r:%s]->(b:%s) delete r",
					actualGraph.getNodes().stream().filter(n -> n.getId().equals(rel.getSourceId())).findFirst()
							.orElseThrow().getLabel(),
					rel.getType(), actualGraph.getNodes().stream().filter(n -> n.getId().equals(rel.getTargetId()))
							.findFirst().orElseThrow().getLabel());
			var session = driver.asyncSession();
			session.writeTransactionAsync(tx -> tx.runAsync(cypher).thenCompose(ResultCursor::consumeAsync))
					.thenCompose(response -> session.closeAsync()).thenApply(signal -> Response.noContent().build());
		}
		for (var node : nodesToBeDeleted) {
			var cypher = String.format("MATCH(n:%s) detach delete n", node.getLabel());
			var session = driver.asyncSession();
			session.writeTransactionAsync(tx -> tx.runAsync(cypher).thenCompose(ResultCursor::consumeAsync))
					.thenCompose(response -> session.closeAsync()).thenApply(signal -> Response.noContent().build());
		}

		// Delete Domain Node (used for line count)
		Set<Domain> domains = actualGraph.getDomains().stream().filter(domain -> domain.getId().equals(domainId))
				.collect(Collectors.toSet());
		for (var domain : domains) {
			String domainLabel = domain.getName();
			var cypher = String.format("MATCH(n:Domain {name:\"%s\"}) detach delete n", domainLabel);
			var session = driver.asyncSession();
			session.writeTransactionAsync(tx -> tx.runAsync(cypher).thenCompose(ResultCursor::consumeAsync))
					.thenCompose(response -> session.closeAsync()).thenApply(signal -> Response.noContent().build());
		}

	}
}
