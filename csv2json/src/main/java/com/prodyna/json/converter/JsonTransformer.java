package com.prodyna.json.converter;

import static java.util.function.Predicate.not;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.Flow;
import java.util.concurrent.Flow.Subscription;
import java.util.concurrent.SubmissionPublisher;

public class JsonTransformer extends SubmissionPublisher<JsonNode>
    implements Flow.Processor<List<String>, JsonNode> {

  private final int bufferSize;
  private JsonNode model;
  private Subscription subscription;
  private int cacheCounter = 0;
  private HashMap<Integer, MappingObject> cache = new HashMap<>();
  private LinkedList<Integer> lastAccessOrder = new LinkedList<>();

  public JsonTransformer(JsonNode model, int bufferSize) {
    super();
    this.model = model;
    this.bufferSize = bufferSize;
  }

  @Override
  public void onSubscribe(Subscription subscription) {
    this.subscription = subscription;
    subscription.request(1);
  }

  @Override
  public void onNext(List<String> line) {
    var hash = generateHash(model, line);
    final MappingObject mappingObject;
    if (cache.containsKey(hash)) {
      mappingObject = cache.get(hash);
    } else {
      mappingObject = new MappingObject();
      cache.put(hash, mappingObject);
    }
    cacheCounter++;
    mappingObject.lineCounter++;
    lastAccessOrder.remove((Object) hash);
    lastAccessOrder.addFirst(hash);
    model.fields().forEachRemaining(e -> mergeField(e.getKey(), e.getValue(), mappingObject, line));
    if (cacheCounter >= bufferSize) {
      var lastObject = cache.remove(lastAccessOrder.removeLast());
      cacheCounter -= lastObject.lineCounter;
      var item = lastObject.toJson();
      submit(item);
    }

    subscription.request(1);
  }

  @Override
  public void onError(Throwable t) {
    t.printStackTrace();
  }

  @Override
  public void onComplete() {
    lastAccessOrder.forEach(
        hash -> {
          submit(cache.remove(hash).toJson());
        });
    close();
  }

  public void accept(List<String> line) {
    var hash = generateHash(model, line);
    final MappingObject mappingObject;
    if (cache.containsKey(hash)) {
      mappingObject = cache.get(hash);
      lastAccessOrder.remove((Object) hash);
    } else {
      mappingObject = new MappingObject();
      cache.put(hash, mappingObject);
    }
    mappingObject.lineCounter++;
    lastAccessOrder.addFirst(hash);
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
    if (hashFields.isEmpty()) {
      model
          .fields()
          .forEachRemaining(
              f -> {
                if (f.getValue().isObject()) {
                  hashFields.add(generateHash(f.getValue(), line));
                }
              });
    }
    return Objects.hash(hashFields.toArray());
  }

  private void mergeModel(JsonNode model, Map<Integer, MappingObject> results, List<String> line) {
    var result = new MappingObject();
    int hash = generateHash(model, line);
    var mappingObject = results.computeIfAbsent(hash, x -> result);
    model.fields().forEachRemaining(e -> mergeField(e.getKey(), e.getValue(), mappingObject, line));
  }

  private void mergeField(
      String name, JsonNode fieldConfig, MappingObject mappingObject, List<String> line) {
    if (fieldConfig.isInt()) {
      mappingObject.primitiveFieldValues.putIfAbsent(name, line.get(fieldConfig.asInt()));
    } else if (fieldConfig.isTextual()) {
      handleTypeConfig(name, fieldConfig, mappingObject, line);

    } else if (fieldConfig.isObject()) {
      handleObject(name, fieldConfig, mappingObject, line);
    } else if (fieldConfig.isArray()) {
      handleArray(name, fieldConfig, mappingObject, line);
    }
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
    var index = config.getIndex();
    if (index >= line.size()) {
      return;
    }
    var field = Optional.of(line.get(index))
        .filter(not(String::isBlank));
    if ("string".equals(config.getType())) {
      mappingObject.primitiveFieldValues.putIfAbsent(name, field.orElse(null));
    } else if ("int".equals(config.getType())) {
      mappingObject.primitiveFieldValues.putIfAbsent(name, field
          .map(Integer::parseInt)
          .orElse(null));
    } else {
      throw new UnsupportedOperationException("type not implemented");
    }
  }
}
