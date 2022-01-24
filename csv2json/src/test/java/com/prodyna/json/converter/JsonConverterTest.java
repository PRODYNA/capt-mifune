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

import static org.junit.jupiter.api.Assertions.*;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
  public void simpleDouble() {
    JsonNode model = new ObjectMapper().createObjectNode().put("age", "0:double");
    var csv = List.of(List.of("1"));
    var jsonNodes = new JsonConverter().toJson(model, csv);
    assertEquals(jsonNodes.size(), 1);
    var node = jsonNodes.elements().next();
    assertTrue(node.get("age").isDouble());
    assertEquals(node.get("age").asDouble(), 1.);
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
  public void objectEmptyArray() {
    var model = new ObjectMapper().createObjectNode();
    model.put("category", 0).putArray("subCategories").addObject().put("name", 1);
    var csv = List.of(List.of("animal"));
    var jsonNodes = new JsonConverter().toJson(model, csv);
    System.out.println(jsonNodes.toPrettyString());
    assertEquals(jsonNodes.size(), 1);
    var node = jsonNodes.elements().next();
    assertTrue(node.get("category").isTextual());
    assertEquals("animal", node.get("category").asText());
    assertNull(node.get("subCategories"));
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
