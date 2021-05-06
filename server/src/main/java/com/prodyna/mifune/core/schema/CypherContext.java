package com.prodyna.mifune.core.schema;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

public class CypherContext {

  public List<CypherContext> subContext = new ArrayList<>();
  private String label;
  private boolean root = false;
  private List<String> statements = new ArrayList<>();

  private List<String> existChecks = new ArrayList<>();
  private String rootVar;

  public List<String> getExistChecks() {
    return existChecks;
  }

  public void setExistChecks(List<String> existChecks) {
    this.existChecks = existChecks;
  }

  public String getRootVar() {
    return rootVar;
  }

  public void setRootVar(String rootVar) {
    this.rootVar = rootVar;
  }

  public void addExistCheck(String propertyPath){
    this.existChecks.add(propertyPath);
  }

  public boolean isRoot() {
    return root;
  }

  public void setRoot(boolean root) {
    this.root = root;
  }

  public String getLabel() {
    return label;
  }

  public void setLabel(String label) {
    this.label = label;
  }

  public List<String> getStatements() {
    return statements;
  }

  public void setStatements(List<String> statements) {
    this.statements = statements;
  }

  public List<CypherContext> getSubContext() {
    return subContext;
  }

  public void setSubContext(List<CypherContext> subContext) {
    this.subContext = subContext;
  }

  public String toCypher(boolean addReturn, int tabCount, AtomicInteger counter) {
    var statements = new ArrayList<>(this.statements);
    if(!subContext.isEmpty()){
      statements.add("with *");
    }

    subContext.forEach(c -> {
      var checks ="";
      if(!c.existChecks.isEmpty()){
       checks = c.existChecks.stream()
           .map("exists(%s)"::formatted)
           .collect(Collectors.joining("and", " where 1=1 and ", ""));
      }

      var subContext = """
          call {
          with %s
          with *%s 
          %s
          return %s
          }
          """
          .formatted(
              this.rootVar,
              checks,
              c.toCypher(false,tabCount,counter),
              counter.incrementAndGet()
          );
      statements.add(addTabs(subContext,tabCount+1));
    });

    if(addReturn){
      statements.add("return 'done'");
    }
    return statements.stream().map(s -> addTabs(s,tabCount)).collect(Collectors.joining("\n"));

//    return String.join("\n", statements);
  }

  String addTabs(String value, int tabCount){
    var tabs =  IntStream.range(0, tabCount).boxed().map(i -> "\t").collect(Collectors.joining());
    return value.lines()
        .map(s -> tabs + s)
        .collect(Collectors.joining("\n"));
  }


}
