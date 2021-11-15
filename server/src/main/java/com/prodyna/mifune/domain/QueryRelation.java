package com.prodyna.mifune.domain;

import java.util.UUID;

public record QueryRelation(
        UUID id,
        String varName,
        UUID relationId,
        UUID sourceId,
        UUID targetId
) {


}
