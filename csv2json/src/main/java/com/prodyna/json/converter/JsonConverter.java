package com.prodyna.json.converter;

import static java.util.function.Predicate.not;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Stream;


public class JsonConverter {

  public ArrayNode toJson(JsonNode model, Collection<List<String>> lines) {
    return toJson(model, lines.stream());
  }

  public ArrayNode toJson(JsonNode model, Stream<List<String>> lines) {
    Map<Integer, MappingObject> objectMap = new HashMap<>();
    lines.forEach(line -> mergeModel(model, objectMap, line));
    var arrayNode = new ObjectMapper().createArrayNode();
    objectMap.values().stream().map(MappingObject::toJson).forEach(arrayNode::add);
    return arrayNode;
  }

  private void mergeModel(JsonNode model, Map<Integer, MappingObject> results, List<String> line) {
    var result = new MappingObject();
    int hash = generateHash(model, line);
    var mappingObject = results.computeIfAbsent(hash, x -> result);
    model.fields().forEachRemaining(e -> mergeField(e.getKey(), e.getValue(), mappingObject, line));
  }

  private int generateHash(JsonNode model, List<String> line) {
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
                var field = line.get(index);
                hashFields.add(field);
              }
            });
    if(hashFields.isEmpty()){
      model.fields().forEachRemaining(f -> {
        if(f.getValue().isObject()){
          hashFields.add(generateHash(f.getValue(),line));
        }
      });
    }
    return Objects.hash(hashFields.toArray());
  }

  private void mergeField(
      String name, JsonNode fieldConfig, MappingObject mappingObject, List<String> line) {
    if (fieldConfig.isInt()) {
      mappingObject.primitiveFieldValues.putIfAbsent(name, line.get(fieldConfig.asInt()));
    } else if (fieldConfig.isTextual()) {
      handleTypeConfig(name, fieldConfig, mappingObject, line);

    } else if (fieldConfig.isObject()) {
      handleObject(name, fieldConfig, mappingObject, line);
    } else if (fieldConfig.isArray()) handleArray(name, fieldConfig, mappingObject, line);
  }

  private void handleArray(
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
      }
    }
  }

  private void handleObject(
      String name, JsonNode fieldConfig, MappingObject mappingObject, List<String> line) {
    var newMappingObject =
        mappingObject.objectFieldValues.computeIfAbsent(name, x -> new MappingObject());
    fieldConfig
        .fields()
        .forEachRemaining(e -> mergeField(e.getKey(), e.getValue(), newMappingObject, line));
  }

  private void handleTypeConfig(
      String name, JsonNode fieldConfig, MappingObject mappingObject, List<String> line) {
    var config = FieldConfig.fromString(fieldConfig.asText());
    var field = line.get(config.getIndex());
    if ("string".equals(config.getType())) {
      mappingObject.primitiveFieldValues.putIfAbsent(name, field);
    } else if ("int".equals(config.getType())) {
      var value =
          Optional.ofNullable(field).filter(not(String::isBlank)).map(Integer::parseInt).orElse(null);
      mappingObject.primitiveFieldValues.putIfAbsent(name, value);
    } else {
      throw new UnsupportedOperationException("type not implemented");
    }
  }

}
