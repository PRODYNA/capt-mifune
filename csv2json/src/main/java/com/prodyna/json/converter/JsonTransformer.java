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

import static com.prodyna.json.converter.JsonConverterUtil.generateHash;
import static com.prodyna.json.converter.JsonConverterUtil.mergeField;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.concurrent.Flow;
import java.util.concurrent.Flow.Subscription;
import java.util.concurrent.SubmissionPublisher;
import java.util.concurrent.atomic.AtomicInteger;

public class JsonTransformer extends SubmissionPublisher<JsonNode>
    implements Flow.Processor<List<String>, JsonNode> {

  private final int bufferSize;
  private final JsonNode model;
  private Subscription subscription;
  private int cacheCounter = 0;
  private final HashMap<Integer, MappingObject> cache = new HashMap<>();
  private final LinkedList<Integer> lastAccessOrder = new LinkedList<>();
  private final AtomicInteger counter = new AtomicInteger(1);

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
    try {
      var count = counter.getAndIncrement();
      var hash = generateHash(model, line);
      final MappingObject mappingObject;
      if (cache.containsKey(hash)) {
        mappingObject = cache.get(hash);
      } else {
        mappingObject = new MappingObject();
        cache.put(hash, mappingObject);
      }
      mappingObject.fromLines.add(count);
      cacheCounter++;
      mappingObject.lineCounter++;
      lastAccessOrder.remove((Object) hash);
      lastAccessOrder.addFirst(hash);
      model
          .fields()
          .forEachRemaining(e -> mergeField(e.getKey(), e.getValue(), mappingObject, line));
      if (cacheCounter >= bufferSize) {
        var lastObject = cache.remove(lastAccessOrder.removeLast());
        cacheCounter -= lastObject.lineCounter;
        var item = lastObject.toJson(true);
        submit(item);
      }
    } catch (Throwable e) {
      onError(e);
    }
    subscription.request(1);
  }

  @Override
  public void onError(Throwable t) {
    t.printStackTrace();
  }

  @Override
  public void onComplete() {
    lastAccessOrder.forEach(hash -> submit(cache.remove(hash).toJson(true)));
    close();
  }
}
