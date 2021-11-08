package com.prodyna.mifune.domain;

/*-
 * #%L
 * prodyna-mifune-server
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

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

public class GraphDelta {

  private UUID trigger;
  private Set<UUID> removedDomains = new HashSet<UUID>();
  private Set<Domain> changedDomains = new HashSet<Domain>();
  private Set<Node> changedNodes = new HashSet<Node>();
  private Set<UUID> removedNodes = new HashSet<UUID>();
  private Set<Relation> changedRelations = new HashSet<Relation>();
  private Set<UUID> removedRelations = new HashSet<UUID>();

  public UUID getTrigger() {
    return trigger;
  }

  public void setTrigger(UUID trigger) {
    this.trigger = trigger;
  }

  public Set<UUID> getRemovedDomains() {
    return removedDomains;
  }

  public void setRemovedDomains(Set<UUID> removedDomains) {
    this.removedDomains = removedDomains;
  }

  public Set<Domain> getChangedDomains() {
    return changedDomains;
  }

  public void setChangedDomains(Set<Domain> changedDomains) {
    this.changedDomains = changedDomains;
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
