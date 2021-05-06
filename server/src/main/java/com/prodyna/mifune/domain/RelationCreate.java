package com.prodyna.mifune.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;

@JsonIgnoreProperties(ignoreUnknown = true)
public record RelationCreate(
    @NotNull
    @NotBlank
    String type,
    /**
     * Primary Key from source Node.
     * Outgoing relation.
     */
    @NotNull UUID sourceId,
    /**
     * Primary Key from target Node.
     * Incoming relation.
     */
    @NotNull UUID targetId,
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

  public RelationCreate(String type, UUID sourceId, UUID targetId, UUID domainId) {
    this(type, sourceId, targetId, Set.of(domainId), false, false, List.of());
  }
  public RelationCreate(String type, UUID sourceId, UUID targetId, Set<UUID> domainIds) {
    this(type, sourceId, targetId, domainIds, false, false, List.of());
  }

}
