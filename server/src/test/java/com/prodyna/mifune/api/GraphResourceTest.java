package com.prodyna.mifune.api;

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

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.Matchers.hasSize;

import com.prodyna.mifune.core.GraphService;
import com.prodyna.mifune.domain.Domain;
import com.prodyna.mifune.domain.DomainCreate;
import com.prodyna.mifune.domain.GraphDelta;
import com.prodyna.mifune.domain.Node;
import com.prodyna.mifune.domain.NodeCreate;
import com.prodyna.mifune.domain.NodeUpdate;
import com.prodyna.mifune.domain.Property;
import com.prodyna.mifune.domain.Relation;
import com.prodyna.mifune.domain.RelationCreate;
import com.prodyna.mifune.domain.RelationUpdate;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import io.vertx.core.json.JsonObject;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.inject.Inject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

@QuarkusTest
class GraphResourceTest {

	@Inject
	GraphService graphService;

	@BeforeEach
	public void reset() {
		graphService.reset();
	}

	@Test
	public void testCreateDomain() {
		var req = new DomainCreate("sample", null, null, null);

		given().when().body(req).contentType(ContentType.JSON).post("/graph/domain").then().statusCode(200).body("name",
				equalTo("sample"));
	}

	@Test
	void updateDomain() {
		Domain sampleDomain = createSampleDomain();
		var updateReq = new DomainCreate("newName");
		given().when().body(updateReq).contentType(ContentType.JSON)
				.put("/graph/domain/%s".formatted(sampleDomain.getId())).then().statusCode(200)
				.body("name", equalTo("newName"));

	}

	@Test
	void deleteDomain() {
		Domain sampleDomain = createSampleDomain();
		given().when().delete("/graph/domain/%s".formatted(sampleDomain.getId())).then().statusCode(200);
	}

	@Test
	void createNode() {
		var sampleDomain = createSampleDomain();
		var nodeCreate = new NodeCreate("Person", sampleDomain.getId());

		given().when().body(nodeCreate).contentType(ContentType.JSON).post("/graph/node").then().statusCode(200).log()
				.body().body("changedNodes[0].label", equalTo("Person"));
	}

	@Test
	void updateNode() {
		var sampleDomain = createSampleDomain();
		Node node = createNodeInDomain(sampleDomain, "Person");

		var nodeUpdate = new NodeUpdate("Car", sampleDomain.getId());

		given().when().body(nodeUpdate).contentType(ContentType.JSON).put("/graph/node/%s".formatted(node.getId()))
				.then().statusCode(200).body("changedNodes", hasSize(1)).body("changedNodes[0].label", equalTo("Car"))
				.body("changedNodes[0].id", equalTo(node.getId().toString()));

	}

	@Test
	void deleteNode() {
		var sampleDomain = createSampleDomain();
		Node node = createNodeInDomain(sampleDomain, "Person");
		given().when().delete("/graph/node/%s".formatted(node.getId())).then().statusCode(200)
				.body("removedNodes", hasSize(1)).body("removedNodes[0]", equalTo(node.getId().toString()));
	}

	@Test
	void createRelation() {
		var sampleDomain = createSampleDomain();
		Node personNode = createNodeInDomain(sampleDomain, "Person");
		Node carNode = createNodeInDomain(sampleDomain, "Car");
		var relationCreate = new RelationCreate("HAS_CAR", personNode.getId(), carNode.getId(),
				personNode.getDomainIds());

		given().when().body(relationCreate).contentType(ContentType.JSON).post("/graph/relation").then().statusCode(200)
				.body("changedRelations", hasSize(1));
	}

	@Test
	void updateRelation() {
		var sampleDomain = createSampleDomain();
		Node personNode = createNodeInDomain(sampleDomain, "Person");
		Node carNode = createNodeInDomain(sampleDomain, "Car");
		Relation relation = buildRelationBetweenNodes(personNode, carNode, "HAS_CAR");
		var relUpdate = new RelationUpdate("NEW_HAS_CAR", relation.getDomainIds());
		given().when().body(relUpdate).contentType(ContentType.JSON)
				.put("/graph/relation/%s".formatted(relation.getId())).then().statusCode(200)
				.body("changedRelations", hasSize(1)).body("changedRelations[0].type", equalTo("NEW_HAS_CAR"));
	}

	@Test
	void deleteRelation() {
		var sampleDomain = createSampleDomain();
		Node personNode = createNodeInDomain(sampleDomain, "Person");
		Node carNode = createNodeInDomain(sampleDomain, "Car");
		Relation relation = buildRelationBetweenNodes(personNode, carNode, "HAS_CAR");
		given().when().delete("/graph/relation/%s".formatted(relation.getId())).then()
				.body("removedRelations", hasSize(1)).body("removedRelations[0]", equalTo(relation.getId().toString()))
				.statusCode(200);
	}

	@Test
	void loadGraph() {
	}

	@Test
	void createJsonModel() {
	}

	@Test
	void runImport() {
	}

	@Test
	void testMapping() {
		Domain sampleDomain = createSampleDomain();
		Property name = new Property();
		name.setName("name");
		name.setType("string");
		name.setPrimary(true);
		Property other = new Property();
		other.setName("other");
		other.setType("string");
		other.setPrimary(false);
		List<Property> props = new ArrayList<Property>();

		props.add(other);
		props.add(name);

		Node blaNode = createNodeInDomain(sampleDomain, "Bla");
		Node blubNode = createNodeInDomain(sampleDomain, "Blub");
		blubNode.setProperties(props);
		Node bliNode = createNodeInDomain(sampleDomain, "Bli");
		bliNode.setProperties(props);

		blaNode = updateNodeInDomain(blaNode, blaNode.getLabel(), props);
		blubNode = updateNodeInDomain(blubNode, blubNode.getLabel(), props);
		bliNode = updateNodeInDomain(bliNode, bliNode.getLabel(), props);

		Relation rel = buildRelationBetweenNodes(blaNode, blubNode, "HAS_BLUB");
		Relation rel2 = buildRelationBetweenNodes(bliNode, blaNode, "HAS_BLA");
		Relation rel3 = buildRelationBetweenNodes(blubNode, bliNode, "HAS_BLI");
		Relation rel4 = buildRelationBetweenNodes(bliNode, blubNode, "HAS_ALSO_BLUB");
		sampleDomain.setRootNodeId(blaNode.getId());
		Domain updatedDomain = updateSampleDomain(sampleDomain);

		JsonObject jo = new JsonObject(
				"{\"bla.name\": null,\"bla.other\": null,\"bla.hasBlub.blub.name\": null,\"bla.hasBlub.blub.other\": null,\"bla.hasBlub.blub.hasBli.bli.name\": null,\"bla.hasBlub.blub.hasBli.bli.other\": null}");
		given().when().get("/graph/domain/%s/mapping".formatted(updatedDomain.getId())).then().statusCode(200)
				.body(is(jo.toString()));

	}

	private Domain createSampleDomain() {
		var req = new DomainCreate("sample");
		return given().when().body(req).contentType(ContentType.JSON).post("/graph/domain").then().statusCode(200)
				.body("name", equalTo("sample")).extract().as(Domain.class);
	}

	private Domain updateSampleDomain(Domain domain) {
		return given().when().body(domain).contentType(ContentType.JSON)
				.put("/graph/domain/%s".formatted(domain.getId())).then().statusCode(200)
				.body("name", equalTo("sample")).extract().as(Domain.class);
	}

	private Node createNodeInDomain(Domain sampleDomain, String label) {
		var nodeCreate = new NodeCreate(label, sampleDomain.getId());

		return given().when().body(nodeCreate).contentType(ContentType.JSON).post("/graph/node").then().statusCode(200)
				.body("changedNodes[0].label", equalTo(label)).extract().as(GraphDelta.class).getChangedNodes().stream()
				.findFirst().orElseThrow();
	}

	private Node updateNodeInDomain(Node sampleNode, String label, List<Property> props) {
		var nodeUpdate = new NodeUpdate(label, sampleNode.getDomainIds(), null, props);
		System.out.println(props);
		return given().when().body(nodeUpdate).contentType(ContentType.JSON)
				.put("/graph/node/{nodeID}", sampleNode.getId()).then().statusCode(200).extract().as(GraphDelta.class)
				.getChangedNodes().stream().findFirst().orElseThrow();
	}

	private Relation buildRelationBetweenNodes(Node personNode, Node carNode, String type) {
		var relationCreate = new RelationCreate(type, personNode.getId(), carNode.getId(), personNode.getDomainIds());

		var relation = given().when().body(relationCreate).contentType(ContentType.JSON).post("/graph/relation").then()
				.statusCode(200).body("changedRelations", hasSize(1)).body("changedRelations[0].type", equalTo(type))
				.extract().as(GraphDelta.class).getChangedRelations().iterator().next();
		return relation;
	}
}
