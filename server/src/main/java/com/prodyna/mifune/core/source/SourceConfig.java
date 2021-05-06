package com.prodyna.mifune.core.source;

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
