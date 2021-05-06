package com.prodyna.mifune.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Node {

  private UUID id;

  private String label;

  private Set<UUID> domainIds;

  private String color;

  private List<Property> properties = new ArrayList<>();

  public Set<UUID> getDomainIds() {
    return domainIds;
  }

  public void setDomainIds(Set<UUID> domainIds) {
    this.domainIds = domainIds;
  }

  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public String getLabel() {
    return label;
  }

  public void setLabel(String label) {
    this.label = label;
  }

  public List<Property> getProperties() {
    return properties;
  }

  public void setProperties(List<Property> properties) {
    this.properties = properties;
  }

  public String getColor() {
    return color;
  }

  public void setColor(String color) {
    this.color = color;
  }
}
