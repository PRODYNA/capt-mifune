package com.prodyna.mifune.domain;

/*-
 * #%L
 * prodyna-mifune-parent
 * %%
 * Copyright (C) 2021 - 2022 PRODYNA SE
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

import com.fasterxml.jackson.annotation.JsonValue;
import org.eclipse.microprofile.openapi.annotations.media.Schema;

@Schema(
    enumeration = {
      PropertyType.Constants.INT,
      PropertyType.Constants.LONG,
      PropertyType.Constants.DOUBLE,
      PropertyType.Constants.FLOAT,
      PropertyType.Constants.STRING,
      PropertyType.Constants.BOOLEAN,
      PropertyType.Constants.DATE,
    })
public enum PropertyType {
  INT(Constants.INT),
  LONG(Constants.LONG),
  DOUBLE(Constants.DOUBLE),
  FLOAT(Constants.FLOAT),
  STRING(Constants.STRING),
  BOOLEAN(Constants.BOOLEAN),
  DATE(Constants.DATE);

  PropertyType(String simpleName) {
    this.simpleName = simpleName;
  }

  private final String simpleName;

  @JsonValue
  public String getSimpleName() {
    return simpleName;
  }

  static class Constants {
    public static final String STRING = "string";
    public static final String INT = "int";
    public static final String LONG = "long";
    public static final String DOUBLE = "double";
    public static final String FLOAT = "float";
    public static final String BOOLEAN = "boolean";
    public static final String DATE = "date";
  }
}
