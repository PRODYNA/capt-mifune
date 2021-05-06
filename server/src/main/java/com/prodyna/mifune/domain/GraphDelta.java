package com.prodyna.mifune.domain;

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
