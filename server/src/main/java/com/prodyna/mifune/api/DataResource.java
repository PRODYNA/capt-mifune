package com.prodyna.mifune.api;

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

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.prodyna.mifune.core.GraphService;
import com.prodyna.mifune.core.json.JsonPathEditor;
import com.prodyna.mifune.core.schema.CypherQueryBuilder;
import com.prodyna.mifune.core.schema.GraphModel;
import com.prodyna.mifune.domain.Query;
import io.smallrye.mutiny.Multi;
import io.smallrye.mutiny.Uni;
import java.util.*;
import java.util.stream.Collectors;
import javax.inject.Inject;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import org.neo4j.driver.Driver;
import org.neo4j.driver.reactive.RxResult;

@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@Path("/data")
public class DataResource {

  @Inject GraphService graphService;

  @Inject protected Driver driver;

  @POST
  public Multi<Map<String, Object>> query(Query query) {



    //
    var graphModel = new GraphModel(graphService.graph());
    var cypherQueryBuilder = new CypherQueryBuilder(graphModel, query);
    var cypher = cypherQueryBuilder.cypher();
    System.out.println(cypher);
    var session = driver.rxSession();
    return Multi.createFrom().publisher(session.run(cypher,cypherQueryBuilder.getParameter()).records())
            .map(cypherQueryBuilder::buildResult)
            .onCompletion().invoke(session::close);
  }

  @GET
  @Path("/domain/{domainId}/keys")
  public Uni<List<String>> createJsonModel(@PathParam("domainId") UUID id) {
    ObjectNode jsonModel = graphService.buildDomainJsonModel(id);
    List<String> paths = new JsonPathEditor().extractFieldPaths(jsonModel);
    var result =
        paths.stream()
            .map(s -> s.replaceAll("\\[", ""))
            .map(s -> s.replaceAll("]", ""))
            .sorted(Comparator.comparing((String s) -> s.split("\\.").length).thenComparing(s -> s))
            .collect(Collectors.toList());
    return Uni.createFrom().item(result);
  }
}
