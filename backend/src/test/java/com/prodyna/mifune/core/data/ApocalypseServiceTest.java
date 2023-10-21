package com.prodyna.mifune.core.data;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.neo4j.driver.Driver;

@QuarkusTest
class ApocalypseServiceTest {

  @Inject Driver driver;

  @Inject ApocalypseService apocalypseService;

  @Test
  void clearDatabase() {
    driver.session().run("create (a:Test)-[rel:RELATION]->(b:Test)");
    driver.session().run("CREATE INDEX test_index FOR (a:Test) ON (a.name)");
    driver
        .session()
        .run(
            "CREATE CONSTRAINT test_constraint IF NOT EXISTS FOR (n:tEST) REQUIRE (n.id) IS UNIQUE");

    List<String> events =
        apocalypseService.clearDatabase().collect().asList().await().indefinitely();

    assertEquals(6, events.size());
    assertEquals("Relations deleted: 1", events.get(0));
    assertEquals("Nodes deleted: 2", events.get(1));
    assertEquals("drop constraint test_constraint", events.get(2));
    assertTrue(events.get(3).startsWith("drop index")); // node index
    assertTrue(events.get(4).startsWith("drop index")); // node index
    assertEquals("drop index test_index", events.get(5));
  }
}
