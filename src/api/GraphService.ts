import {rest} from "./axios";
import {
  Domain,
  DomainCreate,
  DomainUpdate,
  Graph,
  GraphDelta,
  Node,
  NodeCreate, NodeUpdate,
  Relation, RelationCreate, RelationUpdate
} from "./model/Model";
import {AxiosResponse} from "axios";

export class GraphService {

  domainGet(id: string): Promise<Domain>{
    return rest.get<Domain>('graph/domain/'+id)
    .then(res => res.data)
  }

  domainsGet(): Promise<Domain[]>{
    return rest.get<Domain[]>('graph/domains')
    .then(res => res.data)
  }

  domainPost(model: DomainCreate): Promise<Domain>{
    return rest.post<Domain>('graph/domain',model)
    .then(res => res.data)
  }

  domainPut(id: string, model: DomainUpdate ): Promise<Domain>{
    return rest.put<Domain>('graph/domain/'+id,model)
    .then(res => res.data)
  }

  domainDelete(id: string): Promise<GraphDelta>{
    return rest.delete<GraphDelta>('graph/domain/'+id)
    .then(res => res.data)

  }
  domainImport(id: string): Promise<String>{
    return rest.get<String>('graph/domain/'+id +'/import')
    .then(res => res.data)

  }

  graphGet(): Promise<Graph> {
    return rest.get<Graph>('graph')
    .then(r => r.data)
  }

  nodePost(node: NodeCreate): Promise<Node> {
    return rest.post<Node>('graph/node', this.cleanNode(node))
    .then(r => r.data)
  }

  nodePut(node: Node): Promise<GraphDelta> {
    return rest.put<GraphDelta>('graph/node/'+node.id, this.cleanNode(node))
    .then(r => r.data)
  }

  nodeDelete(id: string): Promise<GraphDelta> {
    return rest.delete<GraphDelta>('graph/node/' + id)
    .then(res => res.data)
  }

  relationPost(model: RelationCreate): Promise<GraphDelta> {
    return rest.post<GraphDelta>('graph/relation', this.cleanRelations(model))
    .then(r => r.data)
  }

  relationPut(model: Relation): Promise<GraphDelta> {
    return rest.put<GraphDelta>('graph/relation/'+model.id, this.cleanRelations(model))
    .then(r => r.data)
  }

  relationDelete(id: string): Promise<GraphDelta> {
    return rest.delete<GraphDelta>('graph/relation/' + id)
    .then(res => res.data)
  }

  loadDefaultMappingConfig(domain: Domain): Promise<AxiosResponse<any>> {
    return rest.get('graph/domain/' + domain.id + '/mapping')

  }

  cleanNode(node: NodeCreate | NodeUpdate): NodeCreate | NodeUpdate{
    return {
      label: node.label,
      domainIds: node.domainIds,
      properties: node.properties,
      color: node.color
    }
  }

  cleanRelations(relation: RelationCreate | RelationUpdate): RelationCreate | RelationUpdate {
    return {
      domainIds: relation.domainIds,
      type: relation.type,
      sourceId: relation.sourceId,
      targetId: relation.targetId,
      multiple: relation.multiple,
      primary: relation.primary
    }
  }

  persistGraph(): Promise<any> {
    return rest.post<GraphDelta>('graph')
    .then(r => r.data)
  }
}


const graphService = new GraphService();
export default graphService;

