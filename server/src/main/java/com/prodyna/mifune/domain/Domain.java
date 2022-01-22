package com.prodyna.mifune.domain;

/*-
 * #%L
 * prodyna-mifune-parent
 * %%
 * Copyright (C) 2021 - 2022 PRODYNA SE
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

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.Map;
import java.util.UUID;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Domain {

  private UUID id;

  private String name;

  private UUID rootNodeId;

  private String file;

  private Map<String, String> columnMapping;

  private boolean modelValid;

  private boolean mappingValid;

  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public UUID getRootNodeId() {
    return rootNodeId;
  }

  public void setRootNodeId(UUID rootNodeId) {
    this.rootNodeId = rootNodeId;
  }

  public Map<String, String> getColumnMapping() {
    return columnMapping;
  }

  public void setColumnMapping(Map<String, String> columnMapping) {
    this.columnMapping = columnMapping;
  }

  public String getFile() {
    return file;
  }

  public void setFile(String file) {
    this.file = file;
  }

  public boolean isModelValid() {
    return modelValid;
  }

  public void setModelValid(boolean modelValid) {
    this.modelValid = modelValid;
  }

  public boolean isMappingValid() {
    return mappingValid;
  }

  public void setMappingValid(boolean mappingValid) {
    this.mappingValid = mappingValid;
  }
}
