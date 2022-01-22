match(a:Material)-[:CONTAINS*0..]->(b:Material)
call {
    with b
    match(b)-[r:CONTAINS]->(c:Material)
    optional match path=(c)-[:CONTAINS*0..]->(d:Material)
    with distinct r,c,relationships(path) as rels,d
    with distinct r,c,sum(reduce(m=1,x in rels | m*x.amount) * d.co2) as subComponentValue
    return c.name as componentName, r.amount* subComponentValue as componentValue
}

return distinct  b.name,componentName,componentValue

/////

match(a:Material)-[r:CONTAINS]->(c:Material)
call {
    with c,r
    //match(b)-[r:CONTAINS]->(c:Material)
    optional match path=(c)-[:CONTAINS*0..]->(d:Material)
    with distinct r,c,relationships(path) as rels,d
    with distinct r,c,sum(reduce(m=1,x in rels | m*x.amount) * d.co2) as subComponentValue
    return  r.amount * subComponentValue as componentValue
}

return distinct  a.name,c.name,componentValue