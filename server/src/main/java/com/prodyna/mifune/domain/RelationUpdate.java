package com.prodyna.mifune.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;

@JsonIgnoreProperties(ignoreUnknown = true)
public record RelationUpdate(
    @NotNull
    @NotBlank
    String type,
    /**
     * if domains not exist in source and target node they will be added.
     */
    @NotNull
    @NotEmpty
    Set<UUID> domainIds,

    boolean primary,
    boolean multiple,
    List<Property> properties

) {

  public RelationUpdate(String type, UUID domainId) {
    this(type,  Set.of(domainId), false, false, List.of());
  }

  public RelationUpdate(String type, Set<UUID> domainIds) {
    this(type,  domainIds, false, false, List.of());
  }

}
