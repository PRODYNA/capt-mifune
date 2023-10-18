package com.prodyna.mifune.api;

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

import io.smallrye.mutiny.Multi;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import java.util.concurrent.CompletionStage;
import java.util.function.Supplier;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.jboss.logging.Logger;
import org.neo4j.driver.Driver;
import org.neo4j.driver.async.AsyncSession;

@Path("/api/apocalypse")
@Tag(name = "admin")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class ApocalypseResource {

  @Inject protected Logger log;

  @Inject protected Driver driver;

  @GET
  @Operation(
      summary = "Reset the whole database",
      description =
          """
			Remove all nodes and relation and delete each constraint and index
			""")
  @Produces(MediaType.SERVER_SENT_EVENTS)
  public Multi<String> apocalypseNow() {
    log.info("apocalypse starts now");
    var session = driver.session(AsyncSession.class);

    Supplier<CompletionStage<Long>> deleteAndCountRel =
        () ->
            session
                .runAsync("match()-[r]->() with r limit 10000 delete r return count(r) as count")
                .thenCompose(r -> r.singleAsync().thenApply(count -> count.get("count").asLong()));

    Supplier<CompletionStage<Long>> deleteAndCountNodes =
        () ->
            session
                .runAsync("match(a) with a limit 10000 detach delete a return count(a) as count")
                .thenCompose(r -> r.singleAsync().thenApply(count -> count.get("count").asLong()));

    Supplier<CompletionStage<Long>> dropIndex =
        () ->
            session
                .runAsync(
                    """
                        show index yield name
                        return name
                        """)
                .thenCompose(
                    cursor ->
                        cursor.forEachAsync(
                            rec ->
                                session.runAsync(
                                    "drop index %s".formatted(rec.get("name").asString()))))
                .thenApply(sr -> (long) sr.counters().indexesRemoved());

    Supplier<CompletionStage<Long>> dropConstraints =
        () ->
            session
                .runAsync("""
				show constraints yield name
				return name
				""")
                .thenCompose(
                    cursor ->
                        cursor.forEachAsync(
                            rec ->
                                session.runAsync(
                                    "drop constraint %s".formatted(rec.get("name").asString()))))
                .thenApply(sr -> (long) sr.counters().indexesRemoved());

    return Multi.createBy()
        .repeating()
        .completionStage(deleteAndCountRel)
        .whilst(l -> l > 0)
        .map("%s relations removed"::formatted)
        .onCompletion()
        .switchTo(
            () ->
                Multi.createBy()
                    .repeating()
                    .completionStage(deleteAndCountNodes)
                    .whilst(l -> l > 0)
                    .map("%s nodes removed"::formatted))
        .onCompletion()
        .switchTo(
            () ->
                Multi.createBy()
                    .repeating()
                    .completionStage(dropConstraints)
                    .whilst(l -> l > 0)
                    .map("%s constraints removed"::formatted))
        .onCompletion()
        .switchTo(
            () ->
                Multi.createBy()
                    .repeating()
                    .completionStage(dropIndex)
                    .whilst(l -> l > 0)
                    .map("%s indexes removed"::formatted))
        .onCompletion()
        .invoke(session::closeAsync);
  }
}
