package com.prodyna.mifune.api;

/*-
 * #%L
 * prodyna-mifune-server
 * %%
 * Copyright (C) 2021 PRODYNA SE
 * %%
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * #L%
 */

import com.prodyna.mifune.core.SourceService;
import com.prodyna.mifune.domain.Source;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;
import javax.inject.Inject;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.resteasy.annotations.providers.multipart.MultipartForm;

@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@Path("/sources")

public class SourceResource {

	@ConfigProperty(name = "mifune.upload.dir")
	protected String uploadDir;

	@Inject
	protected SourceService sourceService;

	@POST
	@Consumes(MediaType.MULTIPART_FORM_DATA)
	public Response fileUpload(@MultipartForm MultipartBody upload) throws IOException {
		Files.copy(upload.file, Paths.get(uploadDir, upload.name));
		return Response.ok().build();
	}

	@GET
	public Response sources() throws IOException {
		var files = sourceService.sources().stream().map(fileName -> {
			var source = new Source();
			source.setName(fileName);
			source.setHeader(sourceService.fileHeader(fileName));
			return source;
		}).collect(Collectors.toList());
		return Response.ok().entity(files).build();
	}

}
