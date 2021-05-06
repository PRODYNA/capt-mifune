package com.prodyna.json.converter;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.prodyna.json.converter.JsonConverter;

import java.util.List;
import org.junit.jupiter.api.Test;

class JsonConverterTest {

  @Test
  public void simpleString() {

    JsonNode model = new ObjectMapper().createObjectNode().put("sport", 0);
    var csv = List.of(List.of("JuJutsu"));
    var jsonNodes = new JsonConverter().toJson(model, csv);
    assertEquals(jsonNodes.size(), 1);
    var node = jsonNodes.elements().next();
    assertTrue(node.get("sport").isTextual());
    assertEquals(node.get("sport").asText(), "JuJutsu");
  }

  @Test
  public void testObjectInObject() {
    var model = new ObjectMapper().createObjectNode();
    model.put("sport", 0).putObject("trainer").put("name", 1).put("age", "2:int");
    var csv = List.of(List.of("JuJutsu", "Kay", "35"));
    var jsonNodes = new JsonConverter().toJson(model, csv);
    assertEquals(jsonNodes.size(), 1);
    var node = jsonNodes.elements().next();
    assertTrue(node.get("sport").isTextual());
    assertEquals(node.get("sport").asText(), "JuJutsu");
    var trainer = node.get("trainer");
    assertEquals("Kay", trainer.get("name").asText());
    assertEquals(35, trainer.get("age").asInt());
  }

  @Test
  public void testNullValuesInObject() {
    var model = new ObjectMapper().createObjectNode();
    model.put("sport", 0)
        .putObject("trainer")
        .put("name", 1)
        .put("age", "2:int");
    var csv = List.of(
        List.of("JuJutsu", "Kay", "35"),
        List.of("JuJutsu", "Kay", "")
    );
    var jsonNodes = new JsonConverter().toJson(model, csv);
    assertEquals(jsonNodes.size(), 1);
    var node = jsonNodes.elements().next();
    assertTrue(node.get("sport").isTextual());
    assertEquals(node.get("sport").asText(), "JuJutsu");
    var trainer = node.get("trainer");
    assertEquals("Kay", trainer.get("name").asText());
    assertEquals(35, trainer.get("age").asInt());
  }

  @Test
  public void simpleInt() {
    JsonNode model = new ObjectMapper().createObjectNode().put("age", "0:int");
    var csv = List.of(List.of("1"));
    var jsonNodes = new JsonConverter().toJson(model, csv);
    assertEquals(jsonNodes.size(), 1);
    var node = jsonNodes.elements().next();
    assertTrue(node.get("age").isInt());
    assertEquals(node.get("age").asInt(), 1);
  }

  @Test
  public void stringArray() {
    var model = new ObjectMapper().createObjectNode();
    model.put("category", 0).putArray("subCategories").add(1);
    System.out.println(model.toPrettyString());
    var csv = List.of(List.of("animal", "elephant"), List.of("animal", "hippo"));
    var jsonNodes = new JsonConverter().toJson(model, csv);
    System.out.println(jsonNodes.toPrettyString());
    assertEquals(jsonNodes.size(), 1);
    var node = jsonNodes.elements().next();
    assertTrue(node.get("category").isTextual());
    assertEquals("animal", node.get("category").asText());
    var subCategories = node.get("subCategories");
    assertEquals(2, subCategories.size());
    assertEquals("elephant", subCategories.get(0).asText());
    assertEquals("hippo", subCategories.get(1).asText());
  }

  @Test
  public void objectArray() {
    var model = new ObjectMapper().createObjectNode();
    model.put("category", 0).putArray("subCategories").addObject().put("name", 1);
    var csv = List.of(List.of("animal", "elephant"), List.of("animal", "hippo"));
    var jsonNodes = new JsonConverter().toJson(model, csv);
    System.out.println(jsonNodes.toPrettyString());
    assertEquals(jsonNodes.size(), 1);
    var node = jsonNodes.elements().next();
    assertTrue(node.get("category").isTextual());
    assertEquals("animal", node.get("category").asText());
    assertEquals(2, node.get("subCategories").size());
    assertEquals("elephant", node.get("subCategories").get(0).get("name").asText());
    assertEquals("hippo", node.get("subCategories").get(1).get("name").asText());
  }

  @Test
  public void intArray() {
    var model = new ObjectMapper().createObjectNode();
    model.put("id", 0).putArray("values").add("1:int");
    var csv = List.of(List.of("abc", "1"), List.of("abc", "2"));
    var jsonNodes = new JsonConverter().toJson(model, csv);
    assertEquals(jsonNodes.size(), 1);
    var node = jsonNodes.elements().next();
    assertEquals("abc", node.get("id").asText());
    assertEquals(2, node.get("values").size());
    assertEquals(1, node.get("values").get(0).asInt());
    assertEquals(2, node.get("values").get(1).asInt());
  }
}
