package com.prodyna.mifune.core.schema;

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

import com.prodyna.mifune.domain.Property;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

public class RelationModel {

	private Set<UUID> domainIds = new HashSet<>();
	private String type;
	private boolean multiple;
	private NodeModel from;
	private NodeModel to;
	private boolean primary;
	private List<Property> properties;

	public Set<UUID> getDomainIds() {
		return domainIds;
	}

	public void setDomainIds(Set<UUID> domainIds) {
		this.domainIds = domainIds;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public boolean isMultiple() {
		return multiple;
	}

	public void setMultiple(boolean multiple) {
		this.multiple = multiple;
	}

	public NodeModel getFrom() {
		return from;
	}

	public void setFrom(NodeModel from) {
		this.from = from;
	}

	public NodeModel getTo() {
		return to;
	}

	public void setTo(NodeModel to) {
		this.to = to;
	}

	public boolean isPrimary() {
		return primary;
	}

	public void setPrimary(boolean primary) {
		this.primary = primary;
	}

	public List<Property> getProperties() {
		return properties;
	}

	public void setProperties(List<Property> properties) {
		this.properties = properties;
	}
}
