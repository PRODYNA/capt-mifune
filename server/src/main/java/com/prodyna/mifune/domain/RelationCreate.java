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

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;

@JsonIgnoreProperties(ignoreUnknown = true)
public record RelationCreate(
    @NotNull @NotBlank String type,
    /** Primary Key from source Node. Outgoing relation. */
    @NotNull UUID sourceId,
    /** Primary Key from target Node. Incoming relation. */
    @NotNull UUID targetId,
    /** if domains not exist in source and target node they will be added. */
    @NotNull @NotEmpty Set<UUID> domainIds,
    boolean primary,
    boolean multiple,
    List<Property> properties) {

  public RelationCreate(String type, UUID sourceId, UUID targetId, UUID domainId) {
    this(type, sourceId, targetId, Set.<UUID>of(domainId), false, false, List.of());
  }

  public RelationCreate(String type, UUID sourceId, UUID targetId, Set<UUID> domainIds) {
    this(type, sourceId, targetId, domainIds, false, false, List.of());
  }
}
