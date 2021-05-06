package com.prodyna.mifune.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.UUID;

@JsonIgnoreProperties(ignoreUnknown = true)
public record DomainUpdate
    (
        String name,
        UUID rootNodeId,
        String file,
        String csvJsonMapping
    ) {

  public DomainUpdate(String name) {
    this(name, null, null, null);
  }
}
