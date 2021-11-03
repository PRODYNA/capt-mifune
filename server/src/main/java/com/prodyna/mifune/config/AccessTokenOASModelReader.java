package com.prodyna.mifune.config;

import io.smallrye.openapi.api.models.OpenAPIImpl;
import org.eclipse.microprofile.openapi.OASFactory;
import org.eclipse.microprofile.openapi.OASModelReader;
import org.eclipse.microprofile.openapi.models.OpenAPI;
import org.eclipse.microprofile.openapi.models.security.SecurityScheme;

import java.util.List;

public class AccessTokenOASModelReader implements OASModelReader {

    @Override
    public OpenAPI buildModel() {

        OpenAPIImpl openAPI = new OpenAPIImpl();
        openAPI.setInfo(OASFactory.createInfo().title("Mifune API"));
        openAPI.setSecurity(List.of(OASFactory.createSecurityRequirement().addScheme("access_token")));
        openAPI.components(
                OASFactory.createComponents()
                        .addSecurityScheme(
                                "access_token",
                                OASFactory.createSecurityScheme().type(SecurityScheme.Type.HTTP).scheme("Bearer")));
        return openAPI;
    }
}