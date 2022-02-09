/* eslint-disable class-methods-use-this */
import { AxiosResponse } from 'axios'
import { EventSourcePolyfill } from 'ng-event-source'
import HttpService from '../openapi/HttpService'
import {
  Domain,
  DomainCreate,
  DomainUpdate,
  Filter,
  Graph,
  GraphDelta,
  Node,
  NodeCreate,
  NodeUpdate,
  QueryResultDefinition,
  Relation,
  RelationCreate,
  RelationUpdate,
} from './model/Model'
import UserService from '../auth/UserService'
import { ENV } from '../env/Environments'
import { Query } from '../pages/analytics/QueryBuilder'

const rest = HttpService.getAxiosClient()

export class GraphService {
  data(
    domainId: string,
    results: string[],
    orders: string[] = [],
    filters: string[] = []
  ): Promise<any[]> {
    return rest
      .get<any[]>(`data/domain/${domainId}`, {
        params: { results, orders, filters },
      })
      .then((res) => {
        return res.data
      })
  }

  query(
    query: Query,
    results: QueryResultDefinition[],
    orders: string[] = [],
    filters: Filter[] = []
  ): Promise<any[]> {
    return rest
      .post<any[]>('data', {
        nodes: query.nodes.map((n) => {
          return {
            id: n.id,
            nodeId: n.node.id,
            varName: n.varName,
          }
        }),
        relations: query.relations.map((r) => {
          return {
            id: r.id,
            varName: r.varName,
            relationId: r.relation.id,
            sourceId: r.sourceId,
            targetId: r.targetId,
            depth: r.depth,
          }
        }),
        results,
        orders,
        filters,
      })
      .then((res) => {
        return res.data
      })
  }

  private header(): Record<string, unknown> {
    let headers = {}
    if (localStorage.getItem('LOGIN_REQUIRED')?.toUpperCase() === 'TRUE') {
      headers = {
        Authorization: `Bearer ${UserService.getToken()}`,
      }
    }
    return headers
  }

  cleanDatabase(): EventSourcePolyfill {
    console.log('create Event Source')
    return new EventSourcePolyfill(
      `${localStorage.getItem(ENV.API_SERVER)}apocalypse`,
      {
        headers: this.header(),
        heartbeatTimeout: 2000,
      }
    )
  }

  importSource(): EventSourcePolyfill {
    return new EventSourcePolyfill(
      `${localStorage.getItem(ENV.API_SERVER)}graph/domain/fn/statistics`,
      {
        headers: this.header(),
        heartbeatTimeout: 15000,
      }
    )
  }

  graphStats(): EventSourcePolyfill {
    return new EventSourcePolyfill(
      `${localStorage.getItem(ENV.API_SERVER)}graph/stats`,
      {
        headers: this.header(),
        heartbeatTimeout: 2000,
      }
    )
  }

  domainGet(id: string): Promise<Domain> {
    return rest.get<Domain>(`graph/domain/${id}`).then((res) => {
      console.log('domainGet response', res.data)
      return res.data
    })
  }

  domainCountRootNodest(id: string): Promise<number> {
    return rest.get<number>(`graph/domain/${id}/count`).then((res) => {
      console.log('domainGet response', res.data)
      return res.data
    })
  }

  domainsGet(): Promise<Domain[]> {
    return rest.get<Domain[]>('graph/domains').then((res) => {
      console.log('domainsGet response', res.data)
      return res.data
    })
  }

  domainPost(model: DomainCreate): Promise<Domain> {
    console.log('domainPost model', model)
    return rest.post<Domain>('graph/domain', model).then((res) => {
      console.log('domainPost response: ', res.data)
      return res.data
    })
  }

  domainPut(id: string, model: DomainUpdate): Promise<Domain> {
    console.log('domainPut model', model)
    return rest.put<Domain>(`graph/domain/${id}`, model).then((res) => {
      console.log('domainPut response', res.data)
      return res.data
    })
  }

  domainDelete(id: string): Promise<GraphDelta> {
    return rest.delete<GraphDelta>(`graph/domain/${id}`).then((res) => res.data)
  }

  domainClear(id: string): Promise<string> {
    return rest
      .delete<string>(`graph/domain/${id}/clear`)
      .then((res) => res.data)
  }

  domainRunImport(id: string): Promise<string> {
    return rest.get<string>(`graph/domain/${id}/import`).then((res) => res.data)
  }

  domainStopImport(id: string): Promise<string> {
    return rest
      .delete<string>(`graph/domain/${id}/import`)
      .then((res) => res.data)
  }

  graphGet(): Promise<Graph> {
    return rest.get<Graph>('graph').then((r) => {
      console.log('graphGet response', r.data)
      return r.data
    })
  }

  nodePost(node: NodeCreate): Promise<GraphDelta> {
    return rest
      .post<GraphDelta>('graph/node', this.cleanNode(node))
      .then((r) => r.data)
  }

  nodePut(node: Node): Promise<GraphDelta> {
    return rest
      .put<GraphDelta>(`graph/node/${node.id}`, this.cleanNode(node))
      .then((r) => r.data)
  }

  nodeDelete(id: string): Promise<GraphDelta> {
    return rest.delete<GraphDelta>(`graph/node/${id}`).then((res) => res.data)
  }

  relationPost(model: RelationCreate): Promise<GraphDelta> {
    return rest
      .post<GraphDelta>('graph/relation', this.cleanRelations(model))
      .then((r) => r.data)
  }

  relationPut(model: Relation): Promise<GraphDelta> {
    return rest
      .put<GraphDelta>(`graph/relation/${model.id}`, this.cleanRelations(model))
      .then((r) => r.data)
  }

  relationDelete(id: string): Promise<GraphDelta> {
    return rest
      .delete<GraphDelta>(`graph/relation/${id}`)
      .then((res) => res.data)
  }

  loadDefaultMappingConfig(domain: Domain): Promise<AxiosResponse<any>> {
    return rest.get(`graph/domain/${domain.id}/mapping`)
  }

  loadQueryKeys(domain: Domain): Promise<string[]> {
    return rest.get(`data/domain/${domain.id}/keys`).then((r) => r.data)
  }

  cleanNode(node: NodeCreate | NodeUpdate): NodeCreate | NodeUpdate {
    return {
      label: node.label,
      domainIds: node.domainIds,
      properties: node.properties,
      color: node.color,
    }
  }

  cleanRelations(
    relation: RelationCreate | RelationUpdate
  ): RelationCreate | RelationUpdate {
    return {
      domainIds: relation.domainIds,
      type: relation.type,
      sourceId: relation.sourceId,
      targetId: relation.targetId,
      multiple: relation.multiple,
      primary: relation.primary,
      properties: relation.properties,
    }
  }

  persistGraph(): Promise<any> {
    return rest.post<GraphDelta>('graph').then((r) => r.data)
  }

  possibleRelations(graph: Graph, nodeId: string): Relation[] {
    return graph.relations.filter(
      (r) => r.sourceId === nodeId || r.targetId === nodeId
    )
  }
}

const graphService = new GraphService()
export default graphService
