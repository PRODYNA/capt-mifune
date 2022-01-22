package com.prodyna.mifune.core;

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

import com.prodyna.mifune.core.schema.GraphModel;
import com.prodyna.mifune.core.schema.NodeModel;
import com.prodyna.mifune.core.schema.RelationModel;
import com.prodyna.mifune.domain.*;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import org.neo4j.driver.Record;
import org.neo4j.driver.Value;
import org.neo4j.driver.internal.types.TypeConstructor;

public interface CoreFunction {

  static CoreFunction build(GraphModel graph, Query query, QueryResultDefinition def) {
    return switch (def.function()) {
      case value -> new ValueFunction(def);
      case min -> new SingleFunction(def, "min", Value::asDouble);
      case max -> new SingleFunction(def, "max", Value::asDouble);
      case avg -> new SingleFunction(def, "avg", Value::asDouble);
      case sum -> new SingleFunction(def, "sum", Value::asDouble);
      case count -> new SingleFunction(def, "count", Value::asLong);
      case hierarchyCalculation -> new HierachyCalculationFunction(
          graph, query, def, Value::asDouble);
    };
  }

  private static String singleParameter(QueryResultDefinition definition) {
    if (definition.parameters().size() != 1) {
      throw new IllegalArgumentException("value function need exact one parameter");
    }
    return definition.parameters().get(0);
  }

  static String baseName(String jsonPropertyPath) {
    return jsonPropertyPath.substring(0, jsonPropertyPath.lastIndexOf('.'));
  }

  default String subquery(Function<String, String> varNameGenerator) {
    return "";
  }

  static String propName(String jsonPropertyPath) {
    return jsonPropertyPath.substring(jsonPropertyPath.lastIndexOf('.') + 1);
  }

  List<String> results(
      Function<String, String> varNameGenerator, Function<String, String> varNameCache);

  List<String> distinctObjects();

  Map<String, Object> buildResult(Record record, Function<String, String> varNameCache);

  record ValueFunction(QueryResultDefinition definition) implements CoreFunction {
    @Override
    public List<String> results(
        Function<String, String> varNameGenerator, Function<String, String> varNameCache) {
      String param = singleParameter(definition);
      return List.of(
          "%s.%s as %s"
              .formatted(
                  varNameCache.apply(baseName(param)),
                  propName(param),
                  varNameGenerator.apply(param)));
    }

    @Override
    public List<String> distinctObjects() {
      String param = singleParameter(definition);
      return List.of(baseName(param));
    }

    @Override
    public Map<String, Object> buildResult(Record record, Function<String, String> varNameCache) {
      var value = record.get(varNameCache.apply(singleParameter(definition)));
      var type = TypeConstructor.valueOf(value.type().name());
      var result =
          switch (type) {
            case NULL -> null;
            case INTEGER -> value.asInt();
            case STRING -> value.asString(null);
            case NUMBER -> value.asDouble();
            case BOOLEAN -> value.asBoolean();
            case FLOAT -> value.asFloat();
            default -> throw new UnsupportedOperationException(
                "Unknow type convertion: " + value.type().name());
          };
      Map<String, Object> stringObjectMap = new java.util.HashMap<>();
      stringObjectMap.put(definition.name(), result);
      return stringObjectMap;
    }
  }

  record SingleFunction(
      QueryResultDefinition definition,
      String function,
      Function<Value, Object> valueObjectFunction)
      implements CoreFunction {
    @Override
    public List<String> results(
        Function<String, String> varNameGenerator, Function<String, String> varNameCache) {
      if (definition.parameters().size() != 1) {
        throw new IllegalArgumentException(function + " function need exact one parameter");
      }
      var param = definition.parameters().get(0);
      return List.of(
          function
              + "(%s.%s) as %s"
                  .formatted(
                      varNameCache.apply(baseName(param)),
                      propName(param),
                      varNameGenerator.apply(param)));
    }

    @Override
    public List<String> distinctObjects() {
      if (definition.parameters().size() != 1) {
        throw new IllegalArgumentException(function + " function need exact one parameter");
      }
      var param = definition.parameters().get(0);
      return List.of(baseName(param));
    }

    @Override
    public Map<String, Object> buildResult(Record record, Function<String, String> varNameCache) {
      var value = record.get(varNameCache.apply(singleParameter(definition)));
      return Map.of(definition.name(), valueObjectFunction.apply(value));
    }
  }

  record HierachyCalculationFunction(
      GraphModel graph,
      Query query,
      QueryResultDefinition definition,
      Function<Value, Object> valueObjectFunction)
      implements CoreFunction {

    @Override
    public String subquery(Function<String, String> varNameGenerator) {
      if (definition.parameters().size() != 2) {
        throw new IllegalArgumentException(" function need exact two parameter");
      }
      var relProp = propName(definition.parameters().get(0));
      var relVarName = baseName(definition.parameters().get(0));
      var nodeProp = propName(definition.parameters().get(1));
      var nodeVar = baseName(definition.parameters().get(1));
      var relId =
          query.relations().stream()
              .filter(r -> r.varName().equals(relVarName))
              .findFirst()
              .orElseThrow()
              .relationId();
      var relType = graph.relationById(relId).map(RelationModel::getType).orElseThrow();
      var nodeId =
          query.nodes().stream()
              .filter(r -> r.varName().equals(nodeVar))
              .findFirst()
              .orElseThrow()
              .nodeId();
      var nodeLabel = graph.nodeById(nodeId).map(NodeModel::getLabel).orElseThrow();

      return """

                    call {
                        with __nodeVar__, __relVar__
                        optional match path=(__nodeVar__)-[:__relType__*0..]->(d:__nodeLabel__)
                        with distinct __relVar__,__nodeVar__,relationships(path) as rels,d
                        with distinct __relVar__,__nodeVar__,sum(reduce(m=1,x in rels | m*x.__relProp__) * d.__nodeProp__) as tmpResult
                        return  __relVar__.__relProp__* tmpResult as __resultVar__
                    }
                    """
          .replaceAll("__nodeVar__", varNameGenerator.apply(nodeVar))
          .replaceAll("__nodeProp__", nodeProp)
          .replaceAll("__relVar__", varNameGenerator.apply(relVarName))
          .replaceAll("__relProp__", relProp)
          .replaceAll("__relType__", relType)
          .replaceAll("__nodeLabel__", nodeLabel)
          .replaceAll("__resultVar__", varNameGenerator.apply(definition.name()));
    }

    @Override
    public List<String> results(
        Function<String, String> varNameGenerator, Function<String, String> varNameCache) {
      return List.of(varNameGenerator.apply(definition.name()));
    }

    @Override
    public List<String> distinctObjects() {
      return List.of(definition.name());
    }

    @Override
    public Map<String, Object> buildResult(Record record, Function<String, String> varNameCache) {
      var value = record.get(varNameCache.apply(definition.name()));
      return Map.of(definition.name(), valueObjectFunction.apply(value));
    }
  }
}
