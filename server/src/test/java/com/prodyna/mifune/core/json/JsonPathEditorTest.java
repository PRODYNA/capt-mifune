package com.prodyna.mifune.core.json;

/*-
 * #%L
 * prodyna-mifune-server
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

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;

class JsonPathEditorTest {


    @Test
    public void test() throws JsonProcessingException {
        JsonPathEditor editor = new JsonPathEditor();
        String json = """
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
        editor.update(jsonNode,"name", "Kay");
        System.out.println(jsonNode);
        editor.update(jsonNode,"roles[].name", "Kay");
        System.out.println(jsonNode);
        editor.update(jsonNode,"simple[]", "Simple");
        System.out.println(jsonNode);
    }

    @Test
    public void extractKeys() throws IOException {
        JsonPathEditor editor = new JsonPathEditor();
        String json = """
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
        editor.extractFieldPaths(jsonNode)
        .forEach(System.out::println);
    }
    @Test
    public void remove() throws IOException {
        JsonPathEditor editor = new JsonPathEditor();
        String json = """
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
        editor.remove(jsonNode,"name");
        System.out.println(jsonNode);
        editor.remove(jsonNode,"roles[].name");
        System.out.println(jsonNode);
        editor.remove(jsonNode,"simple[]");
        System.out.println(jsonNode);
    }
}
