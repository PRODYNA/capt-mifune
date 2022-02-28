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

import static java.util.function.Predicate.not;

import com.fasterxml.jackson.databind.JsonNode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

public class JsonConverterUtil {

  static int generateHash(JsonNode model, List<String> line) {
    var hashList = new ArrayList<>();
    generateHash(hashList, model, line);
    var collect = hashList.stream().map(Object::toString).collect(Collectors.joining());
    return collect.hashCode();
  }

  static void generateHash(List<Object> hashFields, JsonNode model, List<String> line) {
    model
        .fields()
        .forEachRemaining(
            e -> {
              var fieldConfig = e.getValue();
              if (fieldConfig.isInt()) {
                var index = fieldConfig.asInt();
                if (index < line.size()) {
                  var value = line.get(index);
                  hashFields.add(value);
                }
              } else if (fieldConfig.isTextual()) {
                var config = fieldConfig.asText();
                var parts = config.split(":");
                var index = Integer.parseInt(parts[0]);
                if (index < line.size()) {
                  var field = line.get(index);
                  hashFields.add(field);
                }
              } else if (fieldConfig.isObject()) {
                generateHash(hashFields, fieldConfig, line);
              } else if (fieldConfig.isArray()) {

              } else {
                throw new IllegalArgumentException();
              }
            });
  }

  static void mergeModel(JsonNode model, Map<Integer, MappingObject> results, List<String> line) {
    int hash = generateHash(model, line);
    var result = results.getOrDefault(hash, new MappingObject());
    model.fields().forEachRemaining(e -> mergeField(e.getKey(), e.getValue(), result, line));
    if (!result.isEmpty()) {
      results.put(hash, result);
    }
  }

  static void mergeField(
      String name, JsonNode fieldConfig, MappingObject mappingObject, List<String> line) {
    if (fieldConfig.isInt()) {
      if (line.size() <= fieldConfig.asInt()) {
        return;
      }
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
      var field = line.get(config.index());
      if ("string".equals(config.type())) {
        mappingObject.primitiveFieldValues.putIfAbsent(name, field);
        list.add(field);
      } else if ("int".equals(config.type())) {
        list.add(Integer.parseInt(field));
      } else if ("long".equals(config.type())) {
        list.add(Long.parseLong(field));
      } else if ("double".equals(config.type())) {
        list.add(Double.parseDouble(field));
      } else if ("float".equals(config.type())) {
        list.add(Float.parseFloat(field));
      } else if ("boolean".equals(config.type())) {
        list.add(Boolean.parseBoolean(field));
      } else if ("date".equals(config.type())) {
        list.add(LocalDate.parse(field));
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
    if (newMappingObject.isEmpty()) {
      mappingObject.objectFieldValues.remove(name);
    }
  }

  static void handleTypeConfig(
      String name, JsonNode fieldConfig, MappingObject mappingObject, List<String> line) {
    var config = FieldConfig.fromString(fieldConfig.asText());
    var index = config.index();
    if (index >= line.size()) {
      return;
    }
    var field = Optional.of(line.get(index)).filter(not(String::isBlank));
    if ("string".equals(config.type())) {
      mappingObject.primitiveFieldValues.putIfAbsent(name, field.orElse(null));
    } else if ("int".equals(config.type())) {
      mappingObject.primitiveFieldValues.putIfAbsent(
          name, field.map(Integer::parseInt).orElse(null));
    } else if ("long".equals(config.type())) {
      mappingObject.primitiveFieldValues.putIfAbsent(name, field.map(Long::parseLong).orElse(null));
    } else if ("double".equals(config.type())) {
      mappingObject.primitiveFieldValues.putIfAbsent(
          name, field.map(Double::parseDouble).orElse(null));
    } else if ("float".equals(config.type())) {
      mappingObject.primitiveFieldValues.putIfAbsent(
          name, field.map(Float::parseFloat).orElse(null));
    } else if ("boolean".equals(config.type())) {
      mappingObject.primitiveFieldValues.putIfAbsent(
          name, field.map(Boolean::parseBoolean).orElse(null));
    } else if ("date".equals(config.type())) {
      mappingObject.primitiveFieldValues.putIfAbsent(
          name, field.map(LocalDate::parse).orElse(null));
    } else {
      throw new UnsupportedOperationException("type not implemented");
    }
  }
}
