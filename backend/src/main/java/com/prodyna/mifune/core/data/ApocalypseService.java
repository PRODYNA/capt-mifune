package com.prodyna.mifune.core.data;

import com.prodyna.mifune.core.DataBaseService;
import io.smallrye.mutiny.Multi;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.Map;
import java.util.function.Supplier;
import org.neo4j.driver.Driver;
import org.neo4j.driver.summary.ResultSummary;
import org.neo4j.driver.summary.SummaryCounters;

@ApplicationScoped
public class ApocalypseService extends DataBaseService {

  protected ApocalypseService(Driver driver) {
    super(driver);
  }

  public Multi<String> clearDatabase() {

    Supplier<Uni<? extends ResultSummary>> deleteRel =
        () -> super.singleStatistic("match()-[r]->() with r limit 1000 delete r", Map.of());
    Supplier<Uni<? extends ResultSummary>> deleteNodes =
        () -> super.singleStatistic("match(a) with a limit 1000 delete a", Map.of());

    var deleteIndexes =
        multiRead(
                "show index yield name return name",
                Map.of(),
                record -> record.get("name").asString())
            .map("drop index %s"::formatted)
            .onItem()
            .transformToUniAndConcatenate(
                cypher -> super.singleStatistic(cypher, Map.of()).map(s -> cypher));

    var deleteConstraints =
        multiRead(
                "show constraints yield name return name",
                Map.of(),
                record -> record.get("name").asString())
            .map("drop constraint %s"::formatted)
            .onItem()
            .transformToUniAndConcatenate(
                cypher -> super.singleStatistic(cypher, Map.of()).map(s -> cypher));

    return deleteAll(deleteRel, SummaryCounters::relationshipsDeleted)
        .onCompletion()
        .switchTo(deleteAll(deleteNodes, SummaryCounters::nodesDeleted))
        .onCompletion()
        .switchTo(deleteConstraints)
        .onCompletion()
        .switchTo(deleteIndexes);
  }
}
