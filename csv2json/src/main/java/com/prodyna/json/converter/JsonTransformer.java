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
