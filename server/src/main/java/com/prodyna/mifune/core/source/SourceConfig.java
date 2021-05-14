package com.prodyna.mifune.core.source;

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

import com.fasterxml.jackson.databind.JsonNode;
import java.util.Map;

public class SourceConfig {

  private String file;
  private Map<String,Object> mappingConfig;

  public String getFile() {
    return file;
  }

  public void setFile(String file) {
    this.file = file;
  }

  public Map<String, Object> getMappingConfig() {
    return mappingConfig;
  }

  public void setMappingConfig(Map<String, Object> mappingConfig) {
    this.mappingConfig = mappingConfig;
  }
}
