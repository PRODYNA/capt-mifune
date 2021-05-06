package com.prodyna.json.converter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.prodyna.json.converter.JsonTransformer;

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
