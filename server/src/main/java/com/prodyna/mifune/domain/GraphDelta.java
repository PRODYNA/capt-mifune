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

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

public class GraphDelta {


  private Set<UUID> removedDomains = new HashSet<UUID>();
  private Set<Node> changedNodes = new HashSet<Node>();
  private Set<UUID> removedNodes = new HashSet<UUID>();
  private Set<Relation> changedRelations = new HashSet<Relation>();
  private Set<UUID> removedRelations = new HashSet<UUID>();

  public Set<UUID> getRemovedDomains() {
    return removedDomains;
  }

  public void setRemovedDomains(Set<UUID> removedDomains) {
    this.removedDomains = removedDomains;
  }

  public Set<Node> getChangedNodes() {
    return changedNodes;
  }

  public void setChangedNodes(Set<Node> changedNodes) {
    this.changedNodes = changedNodes;
  }

  public Set<Relation> getChangedRelations() {
    return changedRelations;
  }

  public void setChangedRelations(Set<Relation> changedRelations) {
    this.changedRelations = changedRelations;
  }

  public Set<UUID> getRemovedNodes() {
    return removedNodes;
  }

  public void setRemovedNodes(Set<UUID> removedNodes) {
    this.removedNodes = removedNodes;
  }

  public Set<UUID> getRemovedRelations() {
    return removedRelations;
  }

  public void setRemovedRelations(Set<UUID> removedRelations) {
    this.removedRelations = removedRelations;
  }
}
