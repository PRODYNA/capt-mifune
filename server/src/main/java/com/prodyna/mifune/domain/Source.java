package com.prodyna.mifune.domain;

import java.util.List;

public class Source {

  private String name;
  private List<String> header;

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public List<String> getHeader() {
    return header;
  }

  public void setHeader(List<String> header) {
    this.header = header;
  }
}
