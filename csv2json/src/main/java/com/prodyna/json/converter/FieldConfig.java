package com.prodyna.json.converter;

/*-
 * #%L
 * csv2json
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
