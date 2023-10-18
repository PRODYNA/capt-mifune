package com.prodyna.mifune.csv2json;

/*-
 * #%L
 * prodyna-mifune-parent
 * %%
 * Copyright (C) 2021 - 2023 PRODYNA SE
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

import static com.prodyna.mifune.csv2json.JsonConverterUtil.mergeModel;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

public class JsonConverter {

  private final ObjectMapper objectMapper;

  public JsonConverter(ObjectMapper objectMapper) {
    this.objectMapper = objectMapper;
  }

  public ArrayNode toJson(JsonNode model, Collection<List<String>> lines) {
    return toJson(model, lines.stream());
  }

  public ArrayNode toJson(JsonNode model, Stream<List<String>> lines) {
    Map<Integer, MappingObject> objectMap = new HashMap<>();
    lines.forEach(line -> mergeModel(model, objectMap, line));
    var arrayNode = objectMapper.createArrayNode();
    objectMap.values().stream().map(mo -> mo.toJson(objectMapper, true)).forEach(arrayNode::add);
    return arrayNode;
  }
}
