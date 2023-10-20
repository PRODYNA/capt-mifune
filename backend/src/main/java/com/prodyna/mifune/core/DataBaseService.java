package com.prodyna.mifune.core;

import io.smallrye.mutiny.Multi;
import io.smallrye.mutiny.Uni;
import jakarta.ws.rs.NotFoundException;
import java.util.Map;
import java.util.function.Function;
import java.util.function.Supplier;
import org.neo4j.driver.Driver;
import org.neo4j.driver.Query;
import org.neo4j.driver.Record;
import org.neo4j.driver.reactive.ReactiveResult;
import org.neo4j.driver.reactive.ReactiveSession;
import org.neo4j.driver.summary.ResultSummary;
import org.neo4j.driver.summary.SummaryCounters;

public abstract class DataBaseService {

  private final Driver driver;

  protected DataBaseService() {
    this.driver = null;
  }

  protected DataBaseService(Driver driver) {
    this.driver = driver;
  }

  public <MODEL> Uni<MODEL> singleRead(
      String cypher, Map<String, Object> parameter, Function<Record, MODEL> buildModel) {
    return multiRead(cypher, parameter, buildModel)
        .collect()
        .first()
        .onItem()
        .ifNull()
        .failWith(NotFoundException::new);
  }

  public <MODEL> Uni<MODEL> singleWrite(
      String cypher, Map<String, Object> parameter, Function<Record, MODEL> buildModel) {
    return multiWrite(cypher, Multi.createFrom().item(parameter), buildModel)
        .collect()
        .first()
        .onItem()
        .ifNull()
        .failWith(() -> new NotFoundException("No result for " + cypher + " " + parameter));
  }

  public Uni<ResultSummary> singleStatistic(String cypher, Map<String, Object> parameter) {
    return multiStatistic(cypher, Multi.createFrom().item(parameter))
        .collect()
        .asList()
        .map(list -> list.get(0));
  }

  public <T> Multi<T> multiRead(
      String cypher, Map<String, Object> parameter, Function<Record, T> buildModel) {

    // Create a stream from a resource we can close in a finalizer...
    return Multi.createFrom()
        .resource(
            () -> driver.session(ReactiveSession.class),
            session ->
                session.executeRead(
                    tx -> {
                      var result = tx.run(new Query(cypher, parameter));
                      return Multi.createFrom().publisher(result).flatMap(ReactiveResult::records);
                    }))
        .withFinalizer(DataBaseService::sessionFinalizer)
        .map(buildModel);
  }

  private static Uni<Void> sessionFinalizer(ReactiveSession session) {
    return Multi.createFrom().publisher(session.close()).collect().first().replaceWithVoid();
  }

  public <T> Multi<T> multiWrite(
      String cypher, Multi<Map<String, Object>> parameters, Function<Record, T> buildModel) {
    return parameters
        .onItem()
        .transformToMultiAndConcatenate(
            p ->
                Multi.createFrom()
                    .resource(
                        () -> driver.session(ReactiveSession.class),
                        session ->
                            session.executeWrite(
                                tx -> {
                                  var result = tx.run(new Query(cypher, p));
                                  return Multi.createFrom()
                                      .publisher(result)
                                      .flatMap(ReactiveResult::records);
                                }))
                    .withFinalizer(DataBaseService::sessionFinalizer)
                    .map(buildModel));
  }

  public Multi<ResultSummary> multiStatistic(String cypher, Multi<Map<String, Object>> parameters) {
    return parameters.flatMap(
        p ->
            Multi.createFrom()
                .resource(
                    () -> driver.session(ReactiveSession.class),
                    session ->
                        session.executeWrite(
                            tx -> {
                              var result = tx.run(new Query(cypher, p));
                              return Multi.createFrom()
                                  .publisher(result)
                                  .flatMap(ReactiveResult::consume);
                            }))
                .withFinalizer(DataBaseService::sessionFinalizer));
  }

  public <T> Multi<T> multiRead(
      String cypher, Multi<Map<String, Object>> parameters, Function<Record, T> buildModel) {
    return parameters.flatMap(
        p ->
            Multi.createFrom()
                .resource(
                    () -> driver.session(ReactiveSession.class),
                    session ->
                        session.executeRead(
                            tx -> {
                              var result = tx.run(new Query(cypher, p));
                              return Multi.createFrom()
                                  .publisher(result)
                                  .flatMap(ReactiveResult::records);
                            }))
                .withFinalizer(DataBaseService::sessionFinalizer)
                .map(buildModel));
  }

  protected Multi<String> deleteAll(
      Supplier<Uni<? extends ResultSummary>> uniSupplier,
      Function<SummaryCounters, Integer> counterFn) {
    return Multi.createBy()
        .repeating()
        .uni(uniSupplier)
        .until(r -> counterFn.apply(r.counters()) == 0)
        .map(r -> "deleted %d".formatted(counterFn.apply(r.counters())));
  }
}
