package com.prodyna.mifune.core;

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

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;
import javax.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;

@ApplicationScoped
public class SourceService {

	@ConfigProperty(name = "mifune.upload.dir")
	protected String uploadDir;

	public List<String> fileHeader(String fileName) {
		var path = Paths.get(uploadDir, fileName);
		try {
			return Files.lines(path).findFirst().map(s -> s.split(",")).map(Arrays::asList).stream()
					.flatMap(Collection::stream).map(String::strip).collect(Collectors.toList());
		} catch (IOException e) {
			throw new RuntimeException();
		}
	}

	public List<String> sources() throws IOException {
		return Files.list(Paths.get(uploadDir)).map(p -> p.getFileName().toString()).filter(s -> s.endsWith(".csv"))
				.sorted().collect(Collectors.toList());
	}

}
