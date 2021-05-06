package com.prodyna.mifune.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.UUID;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Domain {

  private UUID id;

  private String name;

  private UUID rootNodeId;

  private String file;

  private String csvJsonMapping;

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

  public String getCsvJsonMapping() {
    return csvJsonMapping;
  }

  public void setCsvJsonMapping(String csvJsonMapping) {
    this.csvJsonMapping = csvJsonMapping;
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
