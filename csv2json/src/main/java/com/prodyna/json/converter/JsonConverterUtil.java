package com.prodyna.json.converter;

import static java.util.function.Predicate.not;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.*;

public class JsonConverterUtil {

  static int generateHash(JsonNode model, List<String> line) {
    List<Object> hashFields = new ArrayList<>();
    model
        .fields()
        .forEachRemaining(
            e -> {
              var fieldConfig = e.getValue();
              if (fieldConfig.isInt()) {
                var index = fieldConfig.asInt();
                var value = line.get(index);
                hashFields.add(value);
              } else if (fieldConfig.isTextual()) {
                var config = fieldConfig.asText();
                var parts = config.split(":");
                var index = Integer.parseInt(parts[0]);
                if (index < line.size()) {
                  var field = line.get(index);
                  hashFields.add(field);
                }
              }
            });

    model
        .fields()
        .forEachRemaining(
            f -> {
              if (f.getValue().isObject()) {
                hashFields.add(generateHash(f.getValue(), line));
              }
            });

    return Objects.hash(hashFields.toArray());
  }

  static void mergeModel(JsonNode model, Map<Integer, MappingObject> results, List<String> line) {
    var result = new MappingObject();
    int hash = generateHash(model, line);
    var mappingObject = results.computeIfAbsent(hash, x -> result);
    model.fields().forEachRemaining(e -> mergeField(e.getKey(), e.getValue(), mappingObject, line));
  }

  static void mergeField(
      String name, JsonNode fieldConfig, MappingObject mappingObject, List<String> line) {
    if (fieldConfig.isInt()) {
      mappingObject.primitiveFieldValues.putIfAbsent(name, line.get(fieldConfig.asInt()));
    } else if (fieldConfig.isTextual()) {
      handleTypeConfig(name, fieldConfig, mappingObject, line);
    } else if (fieldConfig.isObject()) {
      handleObject(name, fieldConfig, mappingObject, line);
    } else if (fieldConfig.isArray()) {
      handleArray(name, fieldConfig, mappingObject, line);
    } else {
      throw new IllegalArgumentException("can't merge field");
    }
  }

  static void handleArray(
      String name, JsonNode fieldConfig, MappingObject mappingObject, List<String> line) {
    var next = fieldConfig.elements().next();
    if (next.isObject()) {
      var mappingObjectMap =
          mappingObject.objectFieldArrayValues.computeIfAbsent(name, n -> new LinkedHashMap<>());
      mergeModel(next, mappingObjectMap, line);
    } else if (next.isInt()) {
      var list =
          mappingObject.primitiveArrayFieldValues.computeIfAbsent(name, x -> new ArrayList<>());
      list.add(line.get(next.asInt()));
    } else if (next.isTextual()) {
      var list =
          mappingObject.primitiveArrayFieldValues.computeIfAbsent(name, x -> new ArrayList<>());
      var config = FieldConfig.fromString(next.asText());
      var field = line.get(config.getIndex());
      if ("string".equals(config.getType())) {
        mappingObject.primitiveFieldValues.putIfAbsent(name, field);
        list.add(field);
      } else if ("int".equals(config.getType())) {
        list.add(Integer.parseInt(field));
      } else if ("long".equals(config.getType())) {
        list.add(Integer.parseInt(field));
      } else if ("double".equals(config.getType())) {
        list.add(Double.parseDouble(field));
      }
    }
  }

  static void handleObject(
      String name, JsonNode fieldConfig, MappingObject mappingObject, List<String> line) {
    var newMappingObject =
        mappingObject.objectFieldValues.computeIfAbsent(name, x -> new MappingObject());
    fieldConfig
        .fields()
        .forEachRemaining(e -> mergeField(e.getKey(), e.getValue(), newMappingObject, line));
  }

  static void handleTypeConfig(
      String name, JsonNode fieldConfig, MappingObject mappingObject, List<String> line) {
    var config = FieldConfig.fromString(fieldConfig.asText());
    var index = config.getIndex();
    if (index >= line.size()) {
      return;
    }
    var field = Optional.of(line.get(index)).filter(not(String::isBlank));
    if ("string".equals(config.getType())) {
      mappingObject.primitiveFieldValues.putIfAbsent(name, field.orElse(null));
    } else if ("int".equals(config.getType())) {
      mappingObject.primitiveFieldValues.putIfAbsent(
          name, field.map(Integer::parseInt).orElse(null));
    } else if ("long".equals(config.getType())) {
      mappingObject.primitiveFieldValues.putIfAbsent(name, field.map(Long::parseLong).orElse(null));
    } else if ("double".equals(config.getType())) {
      mappingObject.primitiveFieldValues.putIfAbsent(
          name, field.map(Double::parseDouble).orElse(null));
    } else {
      throw new UnsupportedOperationException("type not implemented");
    }
  }
}
