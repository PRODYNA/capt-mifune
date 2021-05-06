package com.prodyna.json.converter;

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
