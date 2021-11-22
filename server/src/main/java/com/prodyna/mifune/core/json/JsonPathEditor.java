package com.prodyna.mifune.core.json;

/*-
 * #%L
 * prodyna-mifune-parent
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
      return node.get(0);

    } else if (node.isObject()) {
      return node.get(part);
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
    Map<String, Object> map = objectMapper.convertValue(node, new TypeReference<>() {});
    ArrayList<List<String>> result = new ArrayList<>();
    extract(result, List.of(), map);
    return result.stream().map(path -> String.join(".", path)).collect(Collectors.toList());
  }

  private void extract(ArrayList<List<String>> result, List<String> prefix, Object value) {
    if (value instanceof Map map) {
      map.forEach(
          (key, v) -> {
            ArrayList<String> newPrefix = new ArrayList<>(prefix);
            if (v instanceof List listValue) {
              newPrefix.add(key + "[]");
              extract(result, newPrefix, listValue.get(0));
            } else {
              newPrefix.add((String) key);
              extract(result, newPrefix, v);
            }
          });
    } else {
      result.add(prefix);
    }
  }
}
