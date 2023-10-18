package com.prodyna.mifune.core.data;

import com.prodyna.mifune.core.DataBaseService;
import com.prodyna.mifune.core.graph.GraphService;
import com.prodyna.mifune.core.schema.CypherQueryBuilder;
import com.prodyna.mifune.core.schema.GraphModel;
import com.prodyna.mifune.domain.GraphStatistics;
import com.prodyna.mifune.domain.Query;
import io.smallrye.mutiny.Multi;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import java.time.Duration;
import java.util.Map;
import java.util.UUID;
import org.neo4j.driver.Driver;

@ApplicationScoped
public class StatisticService extends DataBaseService {

  private final GraphService graphService;

  public StatisticService() {
    super(null);
    this.graphService = null;
  }

  protected StatisticService(Driver driver, GraphService graphService) {
    super(driver);
    this.graphService = graphService;
  }

  public Multi<GraphStatistics> graphStats() {
    return super.multiRead(
        """
                        call {match (a) return count(a) as nodes}
                        call {match ()-[r]->() return count(r) as relations}
                        return nodes, relations
                                        """,
        Multi.createFrom().ticks().every(Duration.ofSeconds(15)).map(tick -> Map.of()),
        r -> new GraphStatistics(r.get("nodes").asLong(), r.get("relations").asLong()));
  }

  public Uni<Map<UUID, Long>> countDomainRootNodes() {
    return super.multiRead(
            "match(x)-[domain:DOMAIN]->(x) return distinct domain.id as id, count(distinct x) as count",
            Map.of(),
            r ->
                new Object() {
                  final UUID id = UUID.fromString(r.get("id").asString());
                  final Long count = r.get("count").asLong();
                })
        .collect()
        .asMap(o -> o.id, o -> o.count);
  }

  public Multi<Map<String, Object>> query(Query query) {
    var graphModel = new GraphModel(graphService.graph());
    var cypherQueryBuilder = new CypherQueryBuilder(graphModel, query);
    var cypher = cypherQueryBuilder.cypher();
    return super.multiRead(
        cypher, cypherQueryBuilder.getParameter(), cypherQueryBuilder::buildResult);
  }
}
