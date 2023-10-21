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

import com.prodyna.mifune.core.source.SourceService;
import com.prodyna.mifune.domain.Source;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@Path("/api/sources")
@Tag(name = "source")
public class SourceResource {

  private final SourceService sourceService;

  private final String uploadDir;

  public SourceResource(
      SourceService sourceService, @ConfigProperty(name = "mifune.upload.dir") String uploadDir) {
    this.sourceService = sourceService;
    this.uploadDir = uploadDir;
  }

  @POST
  @Consumes(MediaType.MULTIPART_FORM_DATA)
  @Operation(operationId = "uploadFile", summary = "Upload a file", description = "Upload a file")
  public Response fileUpload(MultipartBody upload) throws IOException {
    Files.copy(upload.file.uploadedFile(), Paths.get(uploadDir, upload.name));
    return Response.ok().build();
  }

  @GET
  @Operation(
      operationId = "sources",
      summary = "List all sources",
      description = "List all sources")
  public List<Source> sources() throws IOException {
    return sourceService.sources().stream()
        .map(fileName -> new Source(fileName, sourceService.fileHeader(fileName)))
        .collect(Collectors.toList());
  }
}
