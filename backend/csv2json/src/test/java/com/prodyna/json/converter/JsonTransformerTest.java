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
