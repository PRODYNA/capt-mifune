package com.prodyna.mifune.core.data;

import com.prodyna.mifune.core.DataBaseService;
import com.prodyna.mifune.core.graph.GraphService;
import com.prodyna.mifune.core.schema.CypherQueryBuilder;
import com.prodyna.mifune.core.schema.GraphModel;
import com.prodyna.mifune.domain.Domain;
import com.prodyna.mifune.domain.GraphStatistics;
import com.prodyna.mifune.domain.Query;
import io.smallrye.mutiny.Multi;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.neo4j.driver.Driver;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@ApplicationScoped
public class StatisticService extends DataBaseService {

  private static final Logger LOG = LoggerFactory.getLogger(StatisticService.class.getName());

  private final GraphService graphService;

  @Inject
  protected StatisticService(Driver driver, GraphService graphService) {
    super(driver);
    this.graphService = graphService;
  }

  public Multi<GraphStatistics> graphStats() {
    LOG.info("graphStats");
    return super.multiRead(
        """
                        call {match (a) return count(a) as nodes}
                        call {match ()-[r]->() return count(r) as relations}
                        return nodes, relations
                                        """,
        Multi.createFrom().ticks().every(Duration.ofSeconds(5)).map(tick -> Map.of()),
        r -> new GraphStatistics(r.get("nodes").asLong(), r.get("relations").asLong()));
  }

  public Uni<Map<UUID, Long>> countDomainRootNodes() {
    LOG.info("countDomainRootNodes");
    var domainIds =
        graphService.fetchDomains().stream().map(Domain::getId).collect(Collectors.toSet());
    return super.multiRead(
            "match(x)-[domain:DOMAIN]->(x) return distinct domain.id as id, count(distinct x) as count",
            Map.of(),
            r ->
                new Object() {
                  final UUID id = UUID.fromString(r.get("id").asString());
                  final Long count = r.get("count").asLong();
                })
        .collect()
        .asMap(o -> o.id, o -> o.count)
        .map(
            m -> {
              HashMap<UUID, Long> result = new HashMap<>(m);
              domainIds.forEach(id -> result.putIfAbsent(id, 0L));
              return result;
            });
  }

  public Multi<Map<String, Object>> query(Query query) {
    var graphModel = new GraphModel(graphService.graph());
    var cypherQueryBuilder = new CypherQueryBuilder(graphModel, query);
    var cypher = cypherQueryBuilder.cypher();
    HashMap<String, Object> parameter = cypherQueryBuilder.getParameter();
    LOG.info("query: {} {}", cypher, parameter);
    return super.multiRead(cypher, parameter, cypherQueryBuilder::buildResult);
  }
}
