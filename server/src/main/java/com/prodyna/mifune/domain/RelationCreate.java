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

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;

@JsonIgnoreProperties(ignoreUnknown = true)
public record RelationCreate(@NotNull @NotBlank String type,
		/**
		 * Primary Key from source Node. Outgoing relation.
		 */
		@NotNull UUID sourceId,
		/**
		 * Primary Key from target Node. Incoming relation.
		 */
		@NotNull UUID targetId, /**
								 * if domains not exist in source and target node they will be added.
								 */
		@NotNull @NotEmpty Set<UUID> domainIds,

		boolean primary, boolean multiple, List<Property> properties

) {

	public RelationCreate(String type, UUID sourceId, UUID targetId, UUID domainId) {
		this(type, sourceId, targetId, Set.<UUID>of(domainId), false, false, List.of());
	}
	public RelationCreate(String type, UUID sourceId, UUID targetId, Set<UUID> domainIds) {
		this(type, sourceId, targetId, domainIds, false, false, List.of());
	}

}
