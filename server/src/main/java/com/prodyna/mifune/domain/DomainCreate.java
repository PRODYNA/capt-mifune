package com.prodyna.mifune.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.UUID;

@JsonIgnoreProperties(ignoreUnknown = true)
public record DomainCreate
    (
        String name,
        UUID rootNodeId,
        String file,
        String csvJsonMapping
    ) {

  public DomainCreate(String name) {
    this(name, null, null, null);
  }
}
