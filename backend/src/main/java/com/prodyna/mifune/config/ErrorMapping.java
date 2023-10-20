package com.prodyna.mifune.config;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.validation.ValidationException;
import jakarta.ws.rs.ClientErrorException;
import jakarta.ws.rs.ServerErrorException;
import jakarta.ws.rs.core.Response;
import java.util.concurrent.CompletionException;
import org.jboss.resteasy.reactive.RestResponse;
import org.jboss.resteasy.reactive.server.ServerExceptionMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@ApplicationScoped
public class ErrorMapping {
  private static final Logger LOG = LoggerFactory.getLogger(ErrorMapping.class.getName());

  @ServerExceptionMapper
  public RestResponse<Error> mapException(ValidationException ex) {
    return RestResponse.status(Response.Status.BAD_REQUEST, new Error(ex.getMessage()));
  }

  @ServerExceptionMapper
  public RestResponse<Error> mapException(ClientErrorException ex) {
    LOG.debug("Unknown Client Error", ex);
    return RestResponse.status(ex.getResponse().getStatusInfo(), new Error(ex.getMessage()));
  }

  @ServerExceptionMapper
  public RestResponse<Error> mapException(ServerErrorException ex) {
    LOG.error("Unknown Server Error", ex);
    return RestResponse.status(ex.getResponse().getStatusInfo(), new Error("Unknown Server Error"));
  }

  @ServerExceptionMapper
  public RestResponse<Error> mapException(Exception ex) {
    LOG.error("Unknown Error", ex);
    return RestResponse.status(
        Response.Status.INTERNAL_SERVER_ERROR, new Error("Unknown Server Error"));
  }

  @ServerExceptionMapper
  public RestResponse<Error> mapException(CompletionException ex) {
    if (ex.getCause() instanceof ClientErrorException clientEx) {
      return mapException(clientEx);
    } else if (ex.getCause() instanceof ServerErrorException serverEx) {
      return mapException(serverEx);
    }
    LOG.error("Unknown Error", ex);
    return RestResponse.status(
        Response.Status.INTERNAL_SERVER_ERROR, new Error("Unknown Server Error"));
  }
}
