package com.prodyna.json.converter;

/*-
 * #%L
 * prodyna-mifune-parent
 * %%
 * Copyright (C) 2021 - 2022 PRODYNA SE
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

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Objects;

public class MappingObject {

  Integer lineCounter = 0;
  final ArrayList<Integer> fromLines = new ArrayList<>();
  final LinkedHashMap<String, Object> primitiveFieldValues = new LinkedHashMap<>();
  final LinkedHashMap<String, List<Object>> primitiveArrayFieldValues = new LinkedHashMap<>();
  final LinkedHashMap<String, MappingObject> objectFieldValues = new LinkedHashMap<>();
  final LinkedHashMap<String, LinkedHashMap<Integer, MappingObject>> objectFieldArrayValues =
      new LinkedHashMap<>();

  public JsonNode toJson(boolean addLines) {
    ObjectMapper mapper = new ObjectMapper();

    var objectNode = mapper.createObjectNode();
    primitiveFieldValues.forEach(
        (k, v) -> {
          if (v instanceof Integer) {
            objectNode.put(k, (Integer) v);
          } else if (v instanceof Double) {
            objectNode.put(k, (Double) v);
          } else if (v instanceof String) {
            objectNode.put(k, (String) v);
          } else if (v instanceof Long) {
            objectNode.put(k, (Long) v);
          } else if (v instanceof Float) {
            objectNode.put(k, (Float) v);
          } else if (v instanceof Boolean) {
            objectNode.put(k, (Boolean) v);
          } else if (!Objects.isNull(v)) {
            throw new IllegalStateException();
          }
        });
    primitiveArrayFieldValues.forEach(
        (k, values) -> {
          var array = mapper.createArrayNode();
          values.forEach(
              v -> {
                if (v instanceof Integer) {
                  array.add((Integer) v);
                } else if (v instanceof Double) {
                  array.add((Double) v);
                } else if (v instanceof String) {
                  array.add((String) v);
                } else if (v instanceof Float) {
                  array.add((Float) v);
                } else {
                  throw new IllegalStateException();
                }
              });
          objectNode.set(k, array);
        });
    objectFieldValues.forEach((k, v) -> objectNode.set(k, v.toJson(false)));
    objectFieldArrayValues.forEach(
        (k, v) -> {
          var array = mapper.createArrayNode();
          v.values().stream().map(mo -> mo.toJson(false)).forEach(array::add);
          objectNode.set(k, array);
        });

    if (addLines) {
      var lineArray = mapper.createArrayNode();
      fromLines.forEach(lineArray::add);
      objectNode.set("lines", lineArray);
    }
    return objectNode;
  }

  @Override
  public String toString() {
    return toJson(false).toPrettyString();
  }
}
