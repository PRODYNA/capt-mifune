package com.prodyna.json.converter;

/*-
 * #%L
 * csv2json
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

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Objects;

public class MappingObject {

  Integer lineCounter = 0;
  LinkedHashMap<String, Object> primitiveFieldValues = new LinkedHashMap<>();
  LinkedHashMap<String, List<Object>> primitiveArrayFieldValues = new LinkedHashMap<>();
  LinkedHashMap<String, MappingObject> objectFieldValues = new LinkedHashMap<>();
  LinkedHashMap<String, LinkedHashMap<Integer, MappingObject>> objectFieldArrayValues =
      new LinkedHashMap<>();

  public JsonNode toJson() {
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
          } else if (v instanceof Float) {
            objectNode.put(k, (Float) v);
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
    objectFieldValues.forEach((k, v) -> objectNode.set(k, v.toJson()));
    objectFieldArrayValues.forEach(
        (k, v) -> {
          var array = mapper.createArrayNode();
          v.values().stream().map(MappingObject::toJson).forEach(array::add);
          objectNode.set(k, array);
        });

    return objectNode;
  }

  @Override
  public String toString() {
    return toJson().toPrettyString();
  }
}
