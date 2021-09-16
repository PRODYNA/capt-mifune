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
import com.prodyna.mifune.core.schema.CypherUpdateBuilder;
import com.prodyna.mifune.core.schema.GraphJsonBuilder;
import com.prodyna.mifune.core.schema.GraphModel;
import com.prodyna.mifune.domain.Graph;
import java.io.IOException;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class GraphModelUpdateTest {

	public static final UUID DOMAIN_ID = UUID.randomUUID();

	@Test
	public void testMergeNodeByPrimaryKey() throws IOException {
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
				""".replaceAll("\\$userId", userNodeId.toString()).replaceAll("\\$domainId", DOMAIN_ID.toString());
		var updateModel = """
				{"user":{"id":"long"}}
				""";
		var updateCypher = """
				merge(var_1:User {id:$model.user.id})
				merge (domain:Domain {id:$domainId})
				merge(var_1)<-[source:DOMAIN]-(domain)
				on create set source.lines = $model.lines
				on match set source.lines = source.lines + [x in $model.lines where not x in source.lines | x]
				with *
				return 'done'
				""";
		validateModel(graphModel, updateModel, updateCypher);
	}

	@Test
	public void testMergeRelationSameNodeModel() throws IOException {
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
				      {"name":"since", "type":"string"}
				    ]
				}]
				}
				""".replaceAll("\\$nodeId", nodeId.toString()).replaceAll("\\$relId", relId.toString())
				.replaceAll("\\$domainId", DOMAIN_ID.toString());
		var updateModel = """
				{
				  "user" : {
				    "id" : "long",
				    "name" : "string",
				    "friend" : [ {
				      "since" : "string",
				      "user" : {
				        "id" : "long",
				        "name" : "string"
				      }
				    } ]
				  }
				}
				""";
		var updateCypher = """
				merge(var_1:User {id:$model.user.id})
				set var_1.name = coalesce($model.user.name, var_1.name)
				merge (domain:Domain {id:$domainId})
				merge(var_1)<-[source:DOMAIN]-(domain)
				on create set source.lines = $model.lines
				on match set source.lines = source.lines + [x in $model.lines where not x in source.lines | x]
				with *
					call {
					return 1 union
					with var_1
					unwind $model.user.friend as var_2
					merge(var_3:User {id:var_2.user.id})
					set var_3.name = coalesce(var_2.user.name, var_3.name)
					merge(var_1)-[friend:FRIEND]->(var_3)
					set friend.since = coalesce(var_2.since, friend.since)
					with *
					return 1
					}
				return 'done'
				 """;
		validateModel(graphModel, updateModel, updateCypher);
	}

	@Test
	public void testMergeRelationBetweenTwoNodeModels() throws IOException {
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
				""".replaceAll("\\$userId", UUID.randomUUID().toString())
				.replaceAll("\\$carId", UUID.randomUUID().toString())
				.replaceAll("\\$hasCarId", UUID.randomUUID().toString())
				.replaceAll("\\$domainId", DOMAIN_ID.toString());
		var updateModel = """
				{
					"user":{
						"id":"long",
						"hasCar":{
							"car":{
								"id":"long"
							}
						}
					}
				}
				""";

		var updateCypher = """
				merge(var_1:User {id:$model.user.id})
				merge (domain:Domain {id:$domainId})
				merge(var_1)<-[source:DOMAIN]-(domain)
				on create set source.lines = $model.lines
				on match set source.lines = source.lines + [x in $model.lines where not x in source.lines | x]
				with *
					call {
					return 1 union
					with var_1
					with * where 1=1 and exists($model.user.hasCar.car.id)
					merge(var_2:Car {id:$model.user.hasCar.car.id})
					merge(var_1)-[hasCar:HAS_CAR]->(var_2)
					with *
					return 1
					}
				return 'done'
				""";

		validateModel(graphModel, updateModel, updateCypher);

	}

	@Test
	public void testMergeMultiRelationBetweenNodesWithPrimaryKeys() throws IOException {
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
				          "type": "string",
				          "primary": false
				        }
				      ]
				    }
				  ]
				}
				""".replaceAll("\\$userId", UUID.randomUUID().toString())
				.replaceAll("\\$carId", UUID.randomUUID().toString())
				.replaceAll("\\$hasCarId", UUID.randomUUID().toString())
				.replaceAll("\\$domainId", DOMAIN_ID.toString());

		var updateModel = """
				{
				  "user":{
				    "id":"long",
				    "hasCar":[{
				      "since": "string",
				      "car":{
				        "id":"long"
				        }
				    }]
				  }
				}
				""";

		var updateCypher = """
				merge(var_1:User {id:$model.user.id})
				merge (domain:Domain {id:$domainId})
				merge(var_1)<-[source:DOMAIN]-(domain)
				on create set source.lines = $model.lines
				on match set source.lines = source.lines + [x in $model.lines where not x in source.lines | x]
				with *
					call {
					return 1 union
					with var_1
					unwind $model.user.hasCar as var_2
					merge(var_3:Car {id:var_2.car.id})
					merge(var_1)-[hasCar:HAS_CAR]->(var_3)
					set hasCar.since = coalesce(var_2.since, hasCar.since)
					with *
					return 1
					}
				return 'done'
				""";
		validateModel(graphModel, updateModel, updateCypher);
	}

	@Test
	public void testMergeCollectionByRelationWithKeyAndNodeWithoutPrimaryKeys() throws IOException {
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
				           "type": "string",
				           "primary": true
				         }
				       ]
				     }
				   ]
				 }
				""".replaceAll("\\$userId", UUID.randomUUID().toString())
				.replaceAll("\\$carId", UUID.randomUUID().toString())
				.replaceAll("\\$hasCarId", UUID.randomUUID().toString())
				.replaceAll("\\$domainId", DOMAIN_ID.toString());

		var updateModel = """
				 {
				  "user":{
				    "id": "long",
				    "hasCar": [
				    {
				      "since": "string",
				      "car":{
				        "id": "long"
				      }
				    }
				    ]
				  }
				}
				""";

		var updateCypher = """
				merge(var_1:User {id:$model.user.id})
				merge (domain:Domain {id:$domainId})
				merge(var_1)<-[source:DOMAIN]-(domain)
				on create set source.lines = $model.lines
				on match set source.lines = source.lines + [x in $model.lines where not x in source.lines | x]
				with *
					call {
					return 1 union
					with var_1
					unwind $model.user.hasCar as var_2
					merge(var_3:Car {id:var_2.car.id})
					merge(var_1)-[hasCar:HAS_CAR {since:var_2.since}]->(var_3)
					with *
					return 1
					}
				return 'done'
				  """;
		validateModel(graphModel, updateModel, updateCypher);
	}

	@Test
	public void testCombinedPrimaryByRelation() throws IOException {
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
				""".replaceAll("\\$dayId", UUID.randomUUID().toString())
				.replaceAll("\\$monthId", UUID.randomUUID().toString())
				.replaceAll("\\$inId", UUID.randomUUID().toString()).replaceAll("\\$domainId", DOMAIN_ID.toString());

		var updateModel = """
				 {
				  "day":{
				    "id": "long",
				    "in": {
				      "month":{
				        "id": "long"
				      }
				    }
				  }
				}
				""";

		var updateCypher = """
				merge(var_2:Month {id:$model.day.in.month.id})
				merge(var_2)<-[:IN]-(var_1:Day {id:$model.day.id})
				merge (domain:Domain {id:$domainId})
				merge(var_1)<-[source:DOMAIN]-(domain)
				on create set source.lines = $model.lines
				on match set source.lines = source.lines + [x in $model.lines where not x in source.lines | x]
				with *
				return 'done'
				""";
		validateModel(graphModel, updateModel, updateCypher);
	}

	private void validateModel(String graphModel, String updateModel, String updateCypher) throws IOException {
		var graph = new ObjectMapper().createParser(graphModel).readValueAs(Graph.class);
		var node = new ObjectMapper().readTree(updateModel);
		var internalGraphModel = new GraphModel(graph);
		var jsonBuilder = new GraphJsonBuilder(internalGraphModel, DOMAIN_ID, false);
		assertEquals(node.toPrettyString(), jsonBuilder.getJson().toPrettyString());
		var builder = new CypherUpdateBuilder(internalGraphModel, DOMAIN_ID);
		assertEquals(updateCypher.strip(), builder.getCypher());
	}
}
