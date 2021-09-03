package com.prodyna.mifune.core.json;

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

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class JsonPathEditor {

	private final ObjectMapper objectMapper = new ObjectMapper();

	public void update(JsonNode node, String jsonPath, String value) {
		String[] parts = jsonPath.split("\\.");
		String part = "";
		for (int i = 0; i < parts.length; i++) {
			part = parts[i];
			if (part.endsWith("[]")) {
				part = part.substring(0, part.length() - 2);
				node = node.get(part);
				if (node.isArray() && node.get(0).isObject()) {
					node = node.get(0);
				}
			} else {
				if (i < (parts.length - 1)) {
					node = node.get(part);
				}
			}
		}
		if (node.isArray()) {
			((ArrayNode) node).removeAll();
			((ArrayNode) node).add(value);

		} else if (node.isObject()) {
			((ObjectNode) node).put(part, value);
		} else {
			throw new IllegalArgumentException("Path not valid");
		}
	}
	public JsonNode value(JsonNode node, String jsonPath) {
		String[] parts = jsonPath.split("\\.");
		String part = "";
		for (int i = 0; i < parts.length; i++) {
			part = parts[i];
			if (part.endsWith("[]")) {
				part = part.substring(0, part.length() - 2);
				node = node.get(part);
				if (node.isArray() && node.get(0).isObject()) {
					node = node.get(0);
				}
			} else {
				if (i < (parts.length - 1)) {
					node = node.get(part);
				}
			}
		}
		if (node.isArray()) {
			((ArrayNode) node).removeAll();
			return ((ArrayNode) node).get(0);

		} else if (node.isObject()) {
			return ((ObjectNode) node).get(part);
		} else {
			throw new IllegalArgumentException("Path not valid");
		}
	}

	public void remove(JsonNode node, String jsonPath) {
		String[] parts = jsonPath.split("\\.");
		String part = "";
		for (int i = 0; i < parts.length; i++) {
			part = parts[i];
			if (part.endsWith("[]")) {
				part = part.substring(0, part.length() - 2);
				node = node.get(part);
				if (node.isArray() && node.get(0).isObject()) {
					node = node.get(0);
				}
			} else {
				if (i < (parts.length - 1)) {
					node = node.get(part);
				}
			}
		}
		if (node.isArray()) {
			((ArrayNode) node).removeAll();
		} else if (node.isObject()) {
			((ObjectNode) node).remove(part);
		} else {
			throw new IllegalArgumentException("Path not valid");
		}
	}

	public List<String> extractFieldPaths(JsonNode node) {
		Map<String, Object> map = objectMapper.convertValue(node, new TypeReference<>() {
		});
		ArrayList<List<String>> result = new ArrayList<>();
		extract(result, List.of(), map);
		return result.stream().map(path -> String.join(".", path)).collect(Collectors.toList());

	}

	private void extract(ArrayList<List<String>> result, List<String> prefix, Object value) {
		if (value instanceof Map map) {
			map.forEach((key, v) -> {
				ArrayList<String> newPrefix = new ArrayList<>(prefix);
				if (v instanceof List listValue) {
					newPrefix.add(((String) key) + "[]");
					extract(result, newPrefix, listValue.get(0));
				} else {
					newPrefix.add((String) key);
					extract(result, newPrefix, v);
				}
			});
		} else {
			result.add(prefix);
		} ;
	}

}
