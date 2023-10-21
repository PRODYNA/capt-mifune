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

import com.prodyna.mifune.core.data.ApocalypseService;
import com.prodyna.mifune.core.data.DeletionService;
import com.prodyna.mifune.core.data.ImportService;
import io.smallrye.mutiny.Multi;
import io.smallrye.mutiny.Uni;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import java.util.UUID;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@Path("/api/data")
@Tag(name = "data")
public class DataResource {

  private final ImportService importService;

  private final ApocalypseService apocalypseService;

  private final DeletionService deletionService;

  public DataResource(
      ImportService importService,
      ApocalypseService apocalypseService,
      DeletionService deletionService) {
    this.importService = importService;
    this.apocalypseService = apocalypseService;
    this.deletionService = deletionService;
  }

  @Path("/apocalypse")
  @GET
  @Operation(
      operationId = "apocalypseNow",
      summary = "Reset the whole database",
      description = "Remove all nodes and relation and delete each constraint and index.")
  @Produces(MediaType.SERVER_SENT_EVENTS)
  public Multi<String> apocalypseNow() {
    return apocalypseService.clearDatabase();
  }

  @POST
  @Path("/domain/{domainId}")
  @Operation(
      operationId = "importDomain",
      summary = "Import a domain",
      description =
          "Import a domain by its id. The domain must be available in the configured import directory.")
  public Uni<String> runImport(@PathParam("domainId") UUID domainId) {
    return importService.runImport(domainId);
  }

  @POST
  @Path("/domain/{domainId}/cancel")
  @Operation(
      operationId = "cancelImport",
      summary = "Cancel a running import",
      description = "Cancel a running import by its domain id.")
  public Uni<String> stopImport(@PathParam("domainId") UUID domainId) {
    return importService.stopImport(domainId);
  }

  @DELETE
  @Path("/domain/{domainId}")
  @Operation(
      operationId = "clearDomain",
      summary = "Clear a domain",
      description = "Clear a domain by its id. All nodes and relations will be removed.")
  public Uni<String> clearDomain(@PathParam("domainId") UUID domainId) {
    deletionService.deleteDomainFromDatabase(domainId);
    return Uni.createFrom().item("OK");
  }
}
