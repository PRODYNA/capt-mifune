package com.prodyna.mifune.core.schema;

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

import com.prodyna.mifune.domain.Graph;
import com.prodyna.mifune.domain.Property;
import com.prodyna.mifune.domain.Relation;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class CypherIndexBuilder {
  public List<String> getCypher(UUID domainId, Graph graph) {
    List<String> result = new ArrayList<>();

    for (var node : graph.getNodes()) {
      if (node.getDomainIds().contains(domainId)) {
        List<Property> props = new ArrayList<>();
        for (Property prop : node.getProperties()) {
          if (prop.primary()) {
            props.add(prop);
          }
        }
        String propertiesString = getPropertiesString(props);
        if (propertiesString != null) {
          if (graph.getRelations().stream()
              .filter(r -> r.getSourceId().equals(node.getId()))
              .filter(Relation::isPrimary)
              .findAny()
              .isEmpty()) {

            result.add(
                """
                                CREATE CONSTRAINT IF NOT EXISTS FOR (n:%s)
                                REQUIRE (%s) IS UNIQUE
                                """
                    .formatted(node.getLabel(), propertiesString));
          } else {

            result.add(
                "CREATE INDEX IF NOT EXISTS FOR (n:%s) ON (%s)"
                    .formatted(node.getLabel(), propertiesString));
          }
        }
      }
    }
    return result;
  }

  private String getPropertiesString(List<Property> props) {
    String result;
    List<String> propStrings = new ArrayList<>();

    for (Property prop : props) {
      propStrings.add("n.%s".formatted(prop.name()));
    }
    if (propStrings.isEmpty()) {
      return null;
    }
    result = String.join(",", propStrings);
    return result;
  }
}
