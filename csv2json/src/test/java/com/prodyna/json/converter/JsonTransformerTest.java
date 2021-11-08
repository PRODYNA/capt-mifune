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

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.concurrent.SubmissionPublisher;
import java.util.stream.IntStream;
import org.junit.jupiter.api.Test;

class JsonTransformerTest {

  private static final ObjectMapper objMapper = new ObjectMapper();

  @Test
  public void test() throws InterruptedException {
    var publisher = new SubmissionPublisher<List<String>>();
    var model = objMapper.createObjectNode();
    model.put("name", 0).putArray("number").addObject().put("number", 1);
    var transformer = new JsonTransformer(model, 5);
    publisher.subscribe(transformer);
    var subscriber = new PrintSubscriber<>();
    transformer.subscribe(subscriber);
    IntStream.range(0, 10000)
        .boxed()
        .map(i -> List.of(String.valueOf(i - (i % 10)), String.valueOf(i)))
        .forEach(publisher::submit);
    publisher.close();

    Thread.sleep(2000);
  }
}
