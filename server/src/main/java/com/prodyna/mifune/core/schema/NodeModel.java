package com.prodyna.mifune.core.schema;

/*-
 * #%L
 * prodyna-mifune-parent
 * %%
 * Copyright (C) 2021 PRODYNA SE
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
    return Optional.ofNullable(properties).stream()
        .flatMap(Collection::stream)
        .anyMatch(Property::primary);
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

  public String varName() {
    var label = getLabel();
    return label.substring(0, 1).toLowerCase() + label.substring(1);
  }
}
