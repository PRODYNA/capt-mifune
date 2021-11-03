package com.prodyna.mifune.core.schema;

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

import com.prodyna.mifune.domain.Graph;
import com.prodyna.mifune.domain.Node;
import com.prodyna.mifune.domain.Property;

import org.jboss.logging.Logger;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.UUID;
import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;

@ApplicationScoped
public class CypherIndexBuilder {
    @Inject
	protected Logger log;

	public List<String> getCypher(Graph graph, UUID domainId) {

		var statements = new ArrayList<String>();
		List<Node> nodes = new ArrayList<Node>();
		nodes.addAll(graph.getNodes());

		for (var node : nodes) {
			if (node.getDomainIds().contains(domainId)) {
				statements.add("CREATE INDEX FOR (n:%s) ON (%s);".formatted(node.getLabel(), getParameters(node)));
			}
		}
		return statements;
	}

	private String getParameters(Node node) {
		List<String> propNames = new ArrayList<String>();

		for (var prop : node.getProperties()) {
			if (prop.isPrimary()) {
                String parameter = "n." + prop.getName();
				propNames.add(parameter);
			}
		}

        if(propNames.size() <= 1){
            return propNames.get(0);
        }
		return String.join(",", propNames);
	}
}
