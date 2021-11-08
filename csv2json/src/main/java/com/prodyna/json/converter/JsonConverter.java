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

import static com.prodyna.json.converter.JsonConverterUtil.mergeModel;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

public class JsonConverter {

  public ArrayNode toJson(JsonNode model, Collection<List<String>> lines) {
    return toJson(model, lines.stream());
  }

  public ArrayNode toJson(JsonNode model, Stream<List<String>> lines) {
    Map<Integer, MappingObject> objectMap = new HashMap<>();
    lines.forEach(line -> mergeModel(model, objectMap, line));
    var arrayNode = new ObjectMapper().createArrayNode();
    objectMap.values().stream().map(mo -> mo.toJson(true)).forEach(arrayNode::add);
    return arrayNode;
  }
}
