package com.prodyna.mifune.core.schema;


import com.prodyna.mifune.domain.Property;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

public class RelationModel {

  private Set<UUID> domainIds = new HashSet<>();
  private String type;
  private boolean multiple;
  private NodeModel from;
  private NodeModel to;
  private boolean primary;
  private List<Property> properties;

  public Set<UUID> getDomainIds() {
    return domainIds;
  }

  public void setDomainIds(Set<UUID> domainIds) {
    this.domainIds = domainIds;
  }

  public String getType() {
    return type;
  }

  public void setType(String type) {
    this.type = type;
  }

  public boolean isMultiple() {
    return multiple;
  }

  public void setMultiple(boolean multiple) {
    this.multiple = multiple;
  }

  public NodeModel getFrom() {
    return from;
  }

  public void setFrom(NodeModel from) {
    this.from = from;
  }

  public NodeModel getTo() {
    return to;
  }

  public void setTo(NodeModel to) {
    this.to = to;
  }

  public boolean isPrimary() {
    return primary;
  }

  public void setPrimary(boolean primary) {
    this.primary = primary;
  }

  public List<Property> getProperties() {
    return properties;
  }

  public void setProperties(List<Property> properties) {
    this.properties = properties;
  }
}
