package com.prodyna.mifune.core.data;

/*-
 * #%L
 * prodyna-mifune-parent
 * %%
 * Copyright (C) 2021 - 2023 PRODYNA SE
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

import com.prodyna.mifune.core.DataBaseService;
import com.prodyna.mifune.domain.Graph;
import com.prodyna.mifune.domain.Relation;
import io.smallrye.mutiny.Multi;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.neo4j.driver.Driver;
import org.neo4j.driver.summary.SummaryCounters;

@ApplicationScoped
public class DeletionService extends DataBaseService {

  @Inject
  public DeletionService(Driver driver) {
    super(driver);
  }

  public void deleteDomainFromDatabase(UUID domainId, Graph graph) {

    List<Relation> relationsToBeDeleted = graph.relationsByDomainId(domainId, true);

    Multi<String> deleteRalations =
        Multi.createFrom()
            .iterable(relationsToBeDeleted)
            .flatMap(
                rel -> {
                  String sourceLabel = graph.sourceNode(rel).getLabel();
                  String targetLabel = graph.targetNode(rel).getLabel();
                  var cypher =
                      "MATCH(a:%s)-[r:%s]->(b:%s) with r limit 1000 delete r"
                          .formatted(sourceLabel, rel.getType(), targetLabel);
                  return deleteAll(
                      () -> singleStatistic(cypher, Map.of()),
                      SummaryCounters::relationshipsDeleted);
                });

    Multi<String> deleteNodes =
        Multi.createFrom()
            .iterable(graph.nodesByDomainId(domainId, true))
            .flatMap(
                node -> {
                  var cypher = "MATCH(n:%s) wtih n limit 1000 delete n".formatted(node.getLabel());
                  return deleteAll(
                      () -> singleStatistic(cypher, Map.of()), SummaryCounters::nodesDeleted);
                });

    deleteRalations
        .onCompletion()
        .switchTo(deleteNodes)
        .onCompletion()
        .switchTo(
            singleStatistic("MATCH(n:Domain {id:$id}) delete n", Map.of("id", domainId))
                .toMulti()
                .map(summary -> "Domain deleted"));
  }
}
