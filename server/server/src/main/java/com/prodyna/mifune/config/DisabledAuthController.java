package com.prodyna.mifune.config;

import io.quarkus.arc.Priority;
import io.quarkus.security.spi.runtime.AuthorizationController;
import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.inject.Alternative;
import javax.interceptor.Interceptor;
import org.eclipse.microprofile.config.inject.ConfigProperty;

@Alternative
@Priority(Interceptor.Priority.LIBRARY_AFTER)
@ApplicationScoped
public class DisabledAuthController extends AuthorizationController {
  @ConfigProperty(name = "disable.authorization", defaultValue = "false")
  boolean disableAuthorization;

  @Override
  public boolean isAuthorizationEnabled() {
    return !disableAuthorization;
  }
}
