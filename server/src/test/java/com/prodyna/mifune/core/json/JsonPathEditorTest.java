package com.prodyna.mifune.core.json;

/*-
 * #%L
 * prodyna-mifune-server
 * %%
 * Copyright (C) 2021 PRODYNA SE
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

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import org.junit.jupiter.api.Test;

class JsonPathEditorTest {

  @Test
  public void test() throws JsonProcessingException {
    JsonPathEditor editor = new JsonPathEditor();
    String json =
        """
				{
				    "name" : "name",
				    "roles" : [
				    {
				        "name":"name"
				    }],
				    "simple" : ["0"]

				}
				""";
    JsonNode jsonNode = new ObjectMapper().readTree(json);
    System.out.println(jsonNode);
    editor.update(jsonNode, "name", "Kay");
    System.out.println(jsonNode);
    editor.update(jsonNode, "roles[].name", "Kay");
    System.out.println(jsonNode);
    editor.update(jsonNode, "simple[]", "Simple");
    System.out.println(jsonNode);
  }

  @Test
  public void extractKeys() throws IOException {
    JsonPathEditor editor = new JsonPathEditor();
    String json =
        """
				{
				    "name" : "name",
				    "roles" : [
				    {
				        "name":"name"
				    }],
				    "simple" : ["0"]

				}
				""";
    JsonNode jsonNode = new ObjectMapper().readTree(json);
    System.out.println(jsonNode);
    editor.extractFieldPaths(jsonNode).forEach(System.out::println);
  }

  @Test
  public void remove() throws IOException {
    JsonPathEditor editor = new JsonPathEditor();
    String json =
        """
				{
				    "name" : "name",
				    "roles" : [
				    {
				        "name":"name"
				    }],
				    "simple" : ["0"]

				}
				""";
    JsonNode jsonNode = new ObjectMapper().readTree(json);
    System.out.println(jsonNode);
    editor.remove(jsonNode, "name");
    System.out.println(jsonNode);
    editor.remove(jsonNode, "roles[].name");
    System.out.println(jsonNode);
    editor.remove(jsonNode, "simple[]");
    System.out.println(jsonNode);
  }
}
