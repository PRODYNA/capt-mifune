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

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.prodyna.mifune.core.data.StatisticService;
import com.prodyna.mifune.core.graph.GraphService;
import com.prodyna.mifune.core.schema.CypherQueryBuilder;
import com.prodyna.mifune.core.schema.GraphModel;
import com.prodyna.mifune.csv2json.JsonPathEditor;
import com.prodyna.mifune.domain.Query;
import io.smallrye.mutiny.Multi;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.jboss.logging.Logger;
import org.neo4j.driver.Driver;
import org.neo4j.driver.reactive.ReactiveResult;
import org.neo4j.driver.reactive.ReactiveSession;

@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@Path("/api/data")
public class DataResource {

  @Inject protected GraphService graphService;

  @Inject
  protected StatisticService statisticService;

  @POST
  public Multi<Map<String, Object>> query(Query query) {
    return statisticService.query(query);
  }

  @GET
  @Path("/domain/{domainId}/keys")
  public Uni<List<String>> createJsonModel(@PathParam("domainId") UUID id) {
    return Uni.createFrom().item(graphService.createJsonModelKeys(id));
  }
}
