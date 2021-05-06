package com.prodyna.mifune.api;

import java.io.InputStream;
import javax.ws.rs.FormParam;
import javax.ws.rs.core.MediaType;
import org.jboss.resteasy.annotations.providers.multipart.PartType;

public class MultipartBody {

  @FormParam("file")
  @PartType(MediaType.APPLICATION_OCTET_STREAM)
  public InputStream file;

  @FormParam("name")
  @PartType(MediaType.TEXT_PLAIN)
  public String name;
}
