package com.prodyna.mifune.domain;

import java.util.UUID;

public record QueryNode(
        UUID id,
        String varName,
        UUID nodeId
) {
}
