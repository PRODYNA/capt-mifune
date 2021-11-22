package com.prodyna.mifune.core.schema;

/*-
 * #%L
 * prodyna-mifune-parent
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

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

public record CypherUpdateContext(
    boolean root,
    String rootVar,
    List<CypherUpdateContext> subContexts,
    List<String> statements,
    List<String> variables,
    List<String> existChecks) {

  CypherUpdateContext(String rootVar) {
    this(false, rootVar);
  }

  CypherUpdateContext(boolean root, String rootVar) {
    this(root, rootVar, new ArrayList<>(), new ArrayList<>(), new ArrayList<>(), new ArrayList<>());
  }

  public void addExistCheck(String propertyPath) {
    this.existChecks.add(propertyPath);
  }

  public void addStatement(String statement) {
    this.statements.add(statement);
  }

  public CypherUpdateContext addSubContext(String rootVar) {
    var cypherUpdateContext = new CypherUpdateContext(rootVar);
    this.subContexts.add(cypherUpdateContext);
    return cypherUpdateContext;
  }

  public String toCypher(boolean addReturn, int tabCount, AtomicInteger counter) {
    return toCypher(addReturn, tabCount, counter, new ArrayList<>());
  }

  private String toCypher(
      boolean addReturn, int tabCount, AtomicInteger counter, List<String> rootVars) {
    var vars = new ArrayList<>(rootVars);
    vars.add(this.rootVar);
    vars.addAll(this.variables);
    var statements = new ArrayList<>(this.statements);

    subContexts.forEach(
        c -> {
          var checks = "";
          if (!c.existChecks.isEmpty()) {
            checks =
                c.existChecks.stream()
                    .map("exists(%s)"::formatted)
                    .collect(Collectors.joining(" and ", "where 1=1 and ", ""));
          }

          var currentCounter = counter.incrementAndGet();
          var subContext =
              """
                                    call {
                                    return %s union
                                    with %s
                                    %s
                                    return %s
                                    }
                                    """
                  .formatted(
                      currentCounter,
                      vars.stream().filter(Objects::nonNull).collect(Collectors.joining(",")),
                      Optional.of(checks)
                              .filter(Predicate.not(String::isBlank))
                              .map(s -> "with * " + s + "\n")
                              .orElse("")
                          + c.toCypher(false, tabCount, counter, vars),
                      currentCounter);
          statements.add(addTabs(subContext, tabCount + 1));
        });

    if (addReturn) {
      statements.add("return 'done'");
    }
    return statements.stream().map(s -> addTabs(s, tabCount)).collect(Collectors.joining("\n"));
  }

  String addTabs(String value, int tabCount) {
    var tabs = IntStream.range(0, tabCount).boxed().map(i -> "\t").collect(Collectors.joining());
    return value.lines().map(s -> tabs + s).collect(Collectors.joining("\n"));
  }

  public void addVariable(String varName) {
    this.variables.add(varName);
  }
}
