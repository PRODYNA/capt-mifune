package com.prodyna.mifune.csv2json;

/*-
 * #%L
 * prodyna-mifune-parent
 * %%
 * Copyright (C) 2021 - 2023 PRODYNA SE
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
import java.time.LocalDate;
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

  public boolean isEmpty() {
    return primitiveFieldValues.isEmpty()
        && primitiveArrayFieldValues.isEmpty()
        && objectFieldValues.isEmpty()
        && objectFieldArrayValues.isEmpty();
  }

  public JsonNode toJson(boolean addLines) {
    ObjectMapper mapper = new ObjectMapper();

    var objectNode = mapper.createObjectNode();
    primitiveFieldValues.forEach(
        (k, v) -> {
          if (v instanceof Integer i) {
            objectNode.put(k, i);
          } else if (v instanceof Double d) {
            objectNode.put(k, d);
          } else if (v instanceof String s) {
            objectNode.put(k, s);
          } else if (v instanceof Long l) {
            objectNode.put(k, l);
          } else if (v instanceof Float f) {
            objectNode.put(k, f);
          } else if (v instanceof Boolean b) {
            objectNode.put(k, b);
          } else if (v instanceof LocalDate date) {
            objectNode.put(k, date.toString());
          } else if (!Objects.isNull(v)) {
            throw new IllegalStateException();
          }
        });
    primitiveArrayFieldValues.forEach(
        (k, values) -> {
          var array = mapper.createArrayNode();
          values.forEach(
              v -> {
                if (v instanceof Integer i) {
                  array.add(i);
                } else if (v instanceof Double d) {
                  array.add(d);
                } else if (v instanceof String s) {
                  array.add(s);
                } else if (v instanceof Float f) {
                  array.add(f);
                } else if (v instanceof Long l) {
                  array.add(l);
                } else if (v instanceof Boolean b) {
                  array.add(b);
                } else {
                  throw new IllegalStateException();
                }
              });
          objectNode.set(k, array);
        });
    objectFieldValues.forEach(
        (k, v) -> {
          if (!v.isEmpty()) {
            objectNode.set(k, v.toJson(false));
          }
        });
    objectFieldArrayValues.forEach(
        (k, v) -> {
          var array = mapper.createArrayNode();
          v.values().stream()
              .filter(mo -> !mo.isEmpty())
              .map(mo -> mo.toJson(false))
              .forEach(array::add);
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
