package com.prodyna.mifune.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

@JsonIgnoreProperties(ignoreUnknown = true)
public record NodeUpdate(
    @NotBlank String label,
    @Size(min = 1) Set<UUID> domainIds,
    String color,
    List<Property> properties
) {

  public NodeUpdate(String label, UUID domainId) {
    this(label, Set.of(domainId), null, List.of());
  }

}
