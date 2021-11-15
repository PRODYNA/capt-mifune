package com.prodyna.mifune.domain;

import java.util.List;

public record Query(
        List<QueryNode> nodes,
        List<QueryRelation> relations,
        List<String> results,
        List<String> orders,
        List<String> filters
) {

}
