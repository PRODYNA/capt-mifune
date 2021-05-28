package com.prodyna.mifune.domain;

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

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.Map;
import java.util.UUID;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Domain {

  private UUID id;

  private String name;

  private UUID rootNodeId;

  private String file;

  private Map<String,String> columnMapping;

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
