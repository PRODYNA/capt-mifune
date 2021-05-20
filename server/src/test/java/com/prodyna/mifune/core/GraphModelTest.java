package com.prodyna.mifune.core;

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

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.prodyna.mifune.core.schema.CypherBuilder;
import com.prodyna.mifune.core.schema.GraphModel;
import com.prodyna.mifune.core.schema.JsonBuilder;
import com.prodyna.mifune.domain.Graph;
import java.io.IOException;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class GraphModelTest {

  public static final UUID DOMAIN_ID = UUID.randomUUID();

  @Test
  public void testMergeNodeByPrimaryKey()
      throws IOException {
    var userNodeId = UUID.randomUUID();
    var graphModel = """
        {
          "domains": [
            {
              "id": "$domainId",
               "name": "sample",
               "rootNodeId": "$userId"
            }
          ],
          "nodes": [
            {
              "id": "$userId",
              "label": "User",
              "domainIds": ["$domainId"],
              "properties": [
                {
                  "name": "id",
                  "type": "long",
                  "primary": true
                }
              ]
            }
          ]
        }
        """
        .replaceAll("\\$userId", userNodeId.toString())
        .replaceAll("\\$domainId", DOMAIN_ID.toString());
    var updateModel = """
        {"user":{"id":1}}
        """;
    var updateCypher = """
        merge(var_1:User {id:$model.user.id})
        return 'done'
        """;
    validateModel(graphModel, updateModel, updateCypher);
  }

  @Test
  public void testMergeRelationSameNodeModel()
      throws IOException {
    var nodeId = UUID.randomUUID();
    var relId = UUID.randomUUID();
    var graphModel = """
        {
        "domains": [
          {
            "id": "$domainId",
            "name": "sample",
            "rootNodeId": "$nodeId"
          }
        ],
        "nodes": [{
          "domainIds":["$domainId"],
          "id": "$nodeId",
          "label":"User",
          "properties":[
            {"name":"id", "type":"long", "primary": true},
            {"name":"name", "type":"string"}
          ]
        }],
        "relations":[{
            "id": "$relId",
            "domainIds":["$domainId"],
            "sourceId":"$nodeId",
            "targetId":"$nodeId",
            "type":"FRIEND",
            "multiple": true,
            "properties":[
              {"name":"since", "type":"long"}
            ]
        }]
        }
        """
        .replaceAll("\\$nodeId", nodeId.toString())
        .replaceAll("\\$relId", relId.toString())
        .replaceAll("\\$domainId", DOMAIN_ID.toString());
    ;
    var updateModel = """
        {
          "user" : {
            "id" : 1,
            "name" : "string",
            "friend" : [ {
              "since" : 1,
              "user" : {
                "id" : 1,
                "name" : "string"
              }
            } ]
          }
        }
        """;
    var updateCypher = """
        merge(var_1:User {id:$model.user.id})
        set var_1.name = coalesce($model.user.name, var_1.name)\s
        with *
        	call {
        	with var_1
        	with *
        	unwind $model.user.friend as var_2
        	merge(var_3:User {id:var_2.user.id})
        	set var_3.name = coalesce(var_2.user.name, var_3.name)\s
        	merge(var_1)-[friend:FRIEND]->(var_3)
        	set friend.since = coalesce(var_2.since, friend.since)\s
        	return 1
        	}
        return 'done'
         """;
    validateModel(graphModel, updateModel, updateCypher);
  }

  @Test
  public void testMergeRelationBetweenTwoNodeModels()
      throws IOException {
    var graphModel = """
        {
          "domains": [
            {
              "id": "$domainId",
              "name": "sample",
              "rootNodeId": "$userId"
            }
          ],
          "nodes": [
            {
              "domainIds": [
                "$domainId"
              ],
              "id": "$userId",
              "label": "User",
              "properties": [
                {
                  "name": "id",
                  "type": "long",
                  "primary": true
                }
              ]
            },
            {
              "domainIds": [
                "$domainId"
              ],
              "id": "$carId",
              "label": "Car",
              "properties": [
                {
                  "name": "id",
                  "type": "long",
                  "primary": true
                }
              ]
            }
          ],
          "relations": [
            {
              "domainIds": [
                "$domainId"
              ],
              "sourceId": "$userId",
              "targetId": "$carId",
              "type": "HAS_CAR",
              "multiple": false
            }
          ]
        }
        """
        .replaceAll("\\$userId", UUID.randomUUID().toString())
        .replaceAll("\\$carId", UUID.randomUUID().toString())
        .replaceAll("\\$hasCarId", UUID.randomUUID().toString())
        .replaceAll("\\$domainId", DOMAIN_ID.toString());
    var updateModel = """
        {"user":{"id":1, "hasCar":{"car":{"id":1}}}}
        """;

    var updateCypher = """
        merge(var_1:User {id:$model.user.id})
        with *
        	call {
        	with var_1
        	with * where 1=1 and exists($model.user.hasCar.car.id)
        	merge(var_2:Car {id:$model.user.hasCar.car.id})
        	merge(var_1)-[hasCar:HAS_CAR]->(var_2)
        	return 1
        	}
        return 'done'
        """;

    validateModel(graphModel, updateModel, updateCypher);

  }

  @Test
  public void testMergeMultiRelationBetweenNodesWithPrimaryKeys()
      throws IOException {
    var graphModel = """
        {
          "domains": [
            {
              "id": "$domainId",
              "name": "sample",
              "rootNodeId": "$userId"
            }
          ],
          "nodes": [
            {
              "domainIds": [
                "$domainId"
              ],
              "id": "$userId",
              "label": "User",
              "properties": [
                {
                  "name": "id",
                  "type": "long",
                  "primary": true
                }
              ]
            },
            {
              "domainIds": [
                "$domainId"
              ],
              "id": "$carId",
              "label": "Car",
              "root": false,
              "properties": [
                {
                  "name": "id",
                  "type": "long",
                  "primary": true
                }
              ]
            }
          ],
          "relations": [
            {
              "domainIds": [
                "$domainId"
              ],
              "id": "$hasCarId",
              "sourceId": "$userId",
              "targetId": "$carId",
              "type": "HAS_CAR",
              "multiple": true,
              "properties": [
                {
                  "name": "since",
                  "type": "long",
                  "primary": false
                }
              ]
            }
          ]
        }
        """
        .replaceAll("\\$userId", UUID.randomUUID().toString())
        .replaceAll("\\$carId", UUID.randomUUID().toString())
        .replaceAll("\\$hasCarId", UUID.randomUUID().toString())
        .replaceAll("\\$domainId", DOMAIN_ID.toString());

    var updateModel = """
        {
          "user":{
            "id":1,
            "hasCar":[{
              "since": 1,
              "car":{
                "id":1
                }
            }]
          }
        }
        """;

    var updateCypher = """
        merge(var_1:User {id:$model.user.id})
        with *
        	call {
        	with var_1
        	with *
        	unwind $model.user.hasCar as var_2
        	merge(var_3:Car {id:var_2.car.id})
        	merge(var_1)-[hasCar:HAS_CAR]->(var_3)
        	set hasCar.since = coalesce(var_2.since, hasCar.since)\s
        	return 1
        	}
        return 'done'
        """;
    validateModel(graphModel, updateModel, updateCypher);
  }

  @Test
  public void testMergeCollectionByRelationWithKeyAndNodeWithoutPrimaryKeys()
      throws IOException {
    var graphModel = """
         {
           "domains": [
             {
               "id": "$domainId",
               "name": "sample",
               "rootNodeId": "$userId"
             }
           ],
           "nodes": [
             {
               "domainIds": [
                 "$domainId"
               ],
               "id": "$userId",
               "label": "User",
               "properties": [
                 {
                   "name": "id",
                   "type": "long",
                   "primary": true
                 }
               ]
             },
             {
               "domainIds": [
                 "$domainId"
               ],
               "id": "$carId",
               "label": "Car",
               "root": false,
               "properties": [
                 {
                   "name": "id",
                   "type": "long",
                   "primary": true
                 }
               ]
             }
           ],
           "relations": [
             {
               "domainIds": [
                 "$domainId"
               ],
               "id": "$hasCarId",
               "sourceId": "$userId",
               "targetId": "$carId",
               "type": "HAS_CAR",
               "multiple": true,
               "properties": [
                 {
                   "name": "since",
                   "type": "long",
                   "primary": true
                 }
               ]
             }
           ]
         }
        """
        .replaceAll("\\$userId", UUID.randomUUID().toString())
        .replaceAll("\\$carId", UUID.randomUUID().toString())
        .replaceAll("\\$hasCarId", UUID.randomUUID().toString())
        .replaceAll("\\$domainId", DOMAIN_ID.toString());

    var updateModel = """
         {
          "user":{
            "id": 1,
            "hasCar": [
            {
              "since": 1,
              "car":{
                "id": 1
              }
            }
            ]
          }
        }
        """;

    var updateCypher = """
        merge(var_1:User {id:$model.user.id})
        with *
        	call {
        	with var_1
        	with *
        	unwind $model.user.hasCar as var_2
        	merge(var_3:Car {id:var_2.car.id})
        	merge(var_1)-[hasCar:HAS_CAR {since:var_2.since}]->(var_3)
        	return 1
        	}
        return 'done'
          """;
    validateModel(graphModel, updateModel, updateCypher);
  }

  @Test
  public void testCombinedPrimaryByRelation()
      throws IOException {
    var graphModel = """
        {
          "domains": [
            {
              "id": "$domainId",
              "name": "sample",
              "rootNodeId": "$dayId"
            }
          ],
          "nodes": [
            {
              "domainIds": [
                "$domainId"
              ],
              "id": "$dayId",
              "label": "Day",
              "properties": [
                {
                  "name": "id",
                  "type": "long",
                  "primary": true
                }
              ]
            },
            {
              "domainIds": [
                "$domainId"
              ],
              "id": "$monthId",
              "label": "Month",
              "properties": [
                {
                  "name": "id",
                  "type": "long",
                  "primary": true
                }
              ]
            }
          ],
          "relations": [
            {
              "domainIds": [
                "$domainId"
              ],
              "type": "IN",
              "id": "$inId",
              "sourceId": "$dayId",
              "targetId": "$monthId",
              "primary": true,
              "multiple": false
            }
          ]
        }
        """
        .replaceAll("\\$dayId", UUID.randomUUID().toString())
        .replaceAll("\\$monthId", UUID.randomUUID().toString())
        .replaceAll("\\$inId", UUID.randomUUID().toString())
        .replaceAll("\\$domainId", DOMAIN_ID.toString());

    var updateModel = """
         {
          "day":{
            "id": 1,
            "in": {
              "month":{
                "id": 1
              }
            }
          }
        }
        """;

    var updateCypher = """
        merge(var_2:Month {id:$model.day.in.month.id})
        merge(var_2)<-[:IN]-(var_1:Day {id:$model.day.id})
        return 'done'
        """;
    validateModel(graphModel, updateModel, updateCypher);
  }

  private void validateModel(String graphModel, String updateModel, String updateCypher)
      throws IOException {
    var graph = new ObjectMapper().createParser(graphModel).readValueAs(Graph.class);
    var node = new ObjectMapper().readTree(updateModel);
    var internalGraphModel = new GraphModel(graph);
    var jsonBuilder = new JsonBuilder(internalGraphModel, DOMAIN_ID);
    assertEquals(node.toPrettyString(), jsonBuilder.getJson().toPrettyString());
    var builder = new CypherBuilder(internalGraphModel, DOMAIN_ID);
    assertEquals(updateCypher.strip(), builder.getCypher());
  }
}
