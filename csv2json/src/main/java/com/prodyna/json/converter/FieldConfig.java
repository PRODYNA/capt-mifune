package com.prodyna.json.converter;

public class FieldConfig {

  private final String type;
  private final Integer index;

  static FieldConfig fromString(String config) {
    var split = config.split(":");
    return new FieldConfig(Integer.parseInt(split[0]), split[1]);
  }

  public FieldConfig(Integer index, String type) {
    this.type = type;
    this.index = index;
  }

  public Integer getIndex() {
    return index;
  }

  public String getType() {
    return type;
  }
}
