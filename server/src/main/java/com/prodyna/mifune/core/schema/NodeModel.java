package com.prodyna.mifune.core.schema;


import com.prodyna.mifune.domain.Property;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public class NodeModel {

  private UUID id;
  private String label;
  private Set<UUID> domainIds = new HashSet<>();
  private Set<RelationModel> relations = new HashSet<>();
  private List<Property> properties = new ArrayList<>();


  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public boolean isPrimary() {
   return Optional.ofNullable(properties)
        .stream()
        .flatMap(Collection::stream).anyMatch(Property::isPrimary);
  }

  public String getLabel() {
    return label;
  }

  public void setLabel(String label) {
    this.label = label;
  }

  public Set<UUID> getDomainIds() {
    return domainIds;
  }

  public void setDomainIds(Set<UUID> domainIds) {
    this.domainIds = domainIds;
  }

  public Set<RelationModel> getRelations() {
    return relations;
  }

  public void setRelations(Set<RelationModel> relations) {
    this.relations = relations;
  }

  public List<Property> getProperties() {
    return properties;
  }

  public void setProperties(List<Property> properties) {
    this.properties = properties;
  }
}
