package com.prodyna.mifune.core.schema;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.prodyna.mifune.domain.Graph;
import com.prodyna.mifune.domain.Node;
import com.prodyna.mifune.domain.Property;

public class CypherIndexBuilder {
    public List<String> getCypher(UUID domainId, Graph graph){
        List<String> result = new ArrayList<String>();

        for(var node : graph.getNodes()){
            if(node.getDomainIds().contains(domainId)){
                List<Property> props = new ArrayList<Property>();
                for(Property prop : node.getProperties()){
                    if(prop.isPrimary()){
                        props.add(prop);
                    }
                }
                String propertiesString = getPropertiesString(props);
                if(propertiesString != null){
                    result.add("CREATE INDEX FOR (n:%s) ON (%s)".formatted(node.getLabel(), propertiesString));
                }                
            }
        }
        return result;
    }

    private String getPropertiesString(List<Property> props){
        String result = new String();
        List<String> propStrings = new ArrayList<String>();

        for(Property prop: props){
            propStrings.add("n.%s".formatted(prop.getName()));
        }
        if(propStrings.size() < 1){
            return null;
        } 
        result = String.join(",", propStrings);
        return result;
    }
}
