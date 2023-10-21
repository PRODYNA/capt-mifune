package com.prodyna.mifune.core.source;

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

import jakarta.enterprise.context.ApplicationScoped;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@ApplicationScoped
public class SourceService {

  private static final Logger LOG = LoggerFactory.getLogger(SourceService.class.getName());

  @ConfigProperty(name = "mifune.upload.dir")
  protected String uploadDir;

  public List<String> fileHeader(String fileName) {
    var path = Paths.get(uploadDir, fileName);
    try {
      if (!path.toFile().exists()) {
        return List.of();
      }
      return Files.lines(path).findFirst().map(s -> s.split(",")).map(Arrays::asList).stream()
          .flatMap(Collection::stream)
          .map(String::strip)
          .collect(Collectors.toList());
    } catch (IOException e) {
      LOG.error(e.getMessage(), e);
      return List.of();
    }
  }

  public List<String> sources() throws IOException {
    return Files.list(Paths.get(uploadDir))
        .map(p -> p.getFileName().toString())
        .filter(s -> s.endsWith(".csv"))
        .sorted()
        .collect(Collectors.toList());
  }
}
