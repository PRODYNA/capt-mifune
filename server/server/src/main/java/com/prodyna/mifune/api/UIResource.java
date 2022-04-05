package com.prodyna.mifune.api;

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

import io.vertx.ext.web.Router;
import io.vertx.ext.web.handler.StaticHandler;
import java.util.Optional;
import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.event.Observes;
import javax.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

@ApplicationScoped
public class UIResource {

  @ConfigProperty(name = "mifune.auth.realm")
  protected String authRealm;

  @ConfigProperty(name = "mifune.auth.server.url")
  protected String authServerUrl;

  @ConfigProperty(name = "mifune.auth.ui.public.client")
  protected String authPublicClient;

  @ConfigProperty(name = "mifune.root.path.api")
  protected String apiRootPath;

  @ConfigProperty(name = "mifune.root.path.ui")
  protected String uiRootPath;

  @ConfigProperty(name = "quarkus.oidc.enabled")
  protected boolean oidcEnabled;

  @ConfigProperty(name = "vertx.static.content")
  protected Optional<String> vertxStaticContent;

  @Inject Logger logger;

  public void init(@Observes Router router) {
    logger.info("use vertx root path %s".formatted(vertxStaticContent.orElse("unknown")));

    var requestHandler =
        vertxStaticContent.map(StaticHandler::create).orElseGet(StaticHandler::create);
    router.get("/").handler(rc -> rc.redirect("/ui/"));
    router.get("/ui/env.json").handler(r -> r.end(env()));
    router.get("/ui/keycloak.json").handler(r -> r.end(keycloak()));
    router.route("/ui/*").handler(requestHandler);
    router
        .route("/ui/*")
        .handler(
            rc -> {
              logger.info("reroute to index %s".formatted(rc.normalizedPath()));
              rc.reroute("/ui/index.html");
            });
  }

  public String env() {
    return """
            {
              "API_SERVER": "%s",
              "ROOT_URL": "%s",
              "LOGIN_REQUIRED": %s
            }
            """
        .formatted(apiRootPath, uiRootPath, oidcEnabled);
  }

  public String keycloak() {
    return """
            {
            "realm":"%s",
            "auth-server-url":"%s",
            "resource":"%s",
            "public-client":true,
            "ssl-required":"external",
            "confidential-port":0
            }
            """
        .formatted(authRealm, authServerUrl, authPublicClient);
  }
}
