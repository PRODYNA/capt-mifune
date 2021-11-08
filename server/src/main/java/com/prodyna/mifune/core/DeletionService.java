package com.prodyna.mifune.core;

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

import com.prodyna.mifune.domain.*;
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
  @Inject protected Logger log;

  @Inject protected Driver driver;

  public void deleteDomainFromDatabase(UUID domainId, Graph actualGraph) {
    // get all node labels connected to domain id
    List<Node> nodesToBeDeleted =
        actualGraph.getNodes().stream()
            .filter(n -> n.getDomainIds().contains(domainId))
            .filter(n -> n.getDomainIds().size() <= 1)
            .collect(Collectors.toList());
    List<Relation> relationsToBeDeleted =
        actualGraph.getRelations().stream()
            .filter(n -> n.getDomainIds().contains(domainId))
            .filter(n -> n.getDomainIds().size() <= 1)
            .collect(Collectors.toList());

    // build cypher to delete these nodes with all corresponding relations detach
    // delete
    for (var rel : relationsToBeDeleted) {
      var cypher =
          String.format(
              "MATCH(a:%s)-[r:%s]->(b:%s) delete r",
              actualGraph.getNodes().stream()
                  .filter(n -> n.getId().equals(rel.getSourceId()))
                  .findFirst()
                  .orElseThrow()
                  .getLabel(),
              rel.getType(),
              actualGraph.getNodes().stream()
                  .filter(n -> n.getId().equals(rel.getTargetId()))
                  .findFirst()
                  .orElseThrow()
                  .getLabel());
      var session = driver.asyncSession();
      session
          .writeTransactionAsync(tx -> tx.runAsync(cypher).thenCompose(ResultCursor::consumeAsync))
          .thenCompose(response -> session.closeAsync())
          .thenApply(signal -> Response.noContent().build());
    }
    for (var node : nodesToBeDeleted) {
      var cypher = String.format("MATCH(n:%s) detach delete n", node.getLabel());
      var session = driver.asyncSession();
      session
          .writeTransactionAsync(tx -> tx.runAsync(cypher).thenCompose(ResultCursor::consumeAsync))
          .thenCompose(response -> session.closeAsync())
          .thenApply(signal -> Response.noContent().build());
    }

    // Delete Domain Node (used for line count)
    Set<Domain> domains =
        actualGraph.getDomains().stream()
            .filter(domain -> domain.getId().equals(domainId))
            .collect(Collectors.toSet());
    for (var domain : domains) {
      String domainLabel = domain.getName();
      var cypher = String.format("MATCH(n:Domain {name:\"%s\"}) detach delete n", domainLabel);
      var session = driver.asyncSession();
      session
          .writeTransactionAsync(tx -> tx.runAsync(cypher).thenCompose(ResultCursor::consumeAsync))
          .thenCompose(response -> session.closeAsync())
          .thenApply(signal -> Response.noContent().build());
    }
  }
}
