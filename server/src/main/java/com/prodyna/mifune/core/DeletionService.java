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
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import org.jboss.logging.Logger;
import org.neo4j.driver.Driver;

@ApplicationScoped
public class DeletionService {
	@Inject
	protected Logger log;

	@Inject
	protected Driver driver;


	public Boolean deleteDomainFromDatabase(UUID domainId, Graph actualGraph) {
		var graph = actualGraph;
		// get all node labels connected to domain id
		List<Node> nodes = graph.getNodes().stream().filter(n -> n.getDomainIds().contains(domainId))
				.collect(Collectors.toList());
		// build cypher to delete these nodes with all corresponding relations detach
		// delete
		String cypher = "MATCH(n:%s) detach delete n";
		for (var node : nodes) {
			String newCypher = String.format(cypher, node.getLabel());
			log.error(newCypher);
		}
		// run query against DB
		return true;
	}
}
