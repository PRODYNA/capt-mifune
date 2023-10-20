import { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { BaseType, Selection } from 'd3'
import { NodeEdit } from './NodeEdit'
import { Domain, GraphApi, GraphDelta, Node, Relation } from '../../services'
import { RelationEdit } from './RelationEdit'
import { DomainList } from '../domain/DomainList'
import {
  D3Helper,
  D3Node,
  D3Relation,
  NODE_RADIUS,
  SELECTED_NODE_RADIUS,
} from '../../helpers/D3Helper'
import {
  DRAWER_WIDTH,
  DRAWER_WIDTH_OPEN,
} from '../../components/Navigation/SideNavigation'
import DomainActions from '../domain/DomainActions'
import {
  addSvgStyles,
  buildSimulation,
  color,
  drawLabel,
  drawNodes,
  drawRelations,
  nodeMouseEvents,
  svgStyle,
  tick,
} from '../../helpers/GraphHelper'
import AXIOS_CONFIG from '../../openapi/axios-config'
import { GraphContext } from '../../context/GraphContext'

interface IGraph {
  openSidenav: boolean
}

export interface Force {
  fx?: number
  fy?: number
}

interface Path {
  d?: string
}

export const Graph = (props: IGraph): JSX.Element => {
  const { openSidenav } = props
  const {
    selectedDomain,
    domains,
    setDomains,
    hideDomains,
    nodes,
    setNodes,
    relations,
    setRelations,
    selected,
    setSelected,
  } = useContext(GraphContext)
  const [width, setWidth] = useState<number>(800)
  const [height, setHeight] = useState<number>(600)
  const d3Container = useRef(null)
  const graphApi = new GraphApi(AXIOS_CONFIG())

  const getVisibleNodes = (): D3Node<Node>[] => {
    let visibleNodes: D3Node<Node>[]
    if (hideDomains && hideDomains.length > 0) {
      visibleNodes = [...nodes].filter(
        (r) =>
          !((r as D3Node<Node>).node.domainIds ?? []).every((id) =>
            hideDomains?.includes(id)
          )
      )
      return visibleNodes
    }
    return nodes
  }

  const getVisibleRelations = (): D3Relation<Relation>[] => {
    let visibleRelations: D3Relation<Relation>[]
    if (hideDomains && hideDomains.length > 0) {
      visibleRelations = [...relations].filter(
        (r) =>
          !((r as D3Relation<Relation>).relation.domainIds ?? []).every((id) =>
            hideDomains?.includes(id)
          )
      )
      return visibleRelations
    }
    return relations
  }

  const nodeRadius = (n: D3Node<Node>): number => {
    const isSelected =
      selected && 'node' in selected && selected.node.id === n.node.id
    if (isSelected) {
      return SELECTED_NODE_RADIUS
    }
    if (
      Array.from(n.node.domainIds ?? []).some((id) => id === selectedDomain?.id)
    ) {
      return SELECTED_NODE_RADIUS
    }
    return NODE_RADIUS
  }

  const relWidth = (rel: D3Relation<Relation>): number => {
    const isSelected =
      selected &&
      'relation' in selected &&
      selected.relation.id === rel.relation.id
    if (isSelected) {
      return 14
    }
    if (
      Array.from(rel.relation.domainIds ?? []).some(
        (id) => id === selectedDomain?.id
      )
    ) {
      return 10
    }
    return 10
  }

  useEffect(() => {
    nodes.forEach((n) => {
      // eslint-disable-next-line no-param-reassign
      n.radius = nodeRadius(n)
      return n
    })
    setNodes(nodes)
    relations.forEach((n) => {
      // eslint-disable-next-line no-param-reassign
      n.width = relWidth(n)
      return n
    })
    setRelations(relations)
  }, [selectedDomain, selected])

  const handleResize = (): void => {
    setWidth(window.innerWidth)
    setHeight(window.innerHeight)
  }

  useEffect(() => {
    window.addEventListener('resize', handleResize)
    return (): void => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  useLayoutEffect(() => {
    setWidth(window.innerWidth)
    setHeight(window.innerHeight)
  }, [])

  const updateNodes = (graphDelta: GraphDelta): void => {
    let d3Nodes = nodes.filter(
      (n) =>
        !Array.from(graphDelta.removedNodes ?? []).some(
          (id) => id === n.node.id
        )
    )
    graphDelta.changedNodes?.forEach((cn) => {
      if (d3Nodes.some((n) => n.node.id === cn.id)) {
        const [changeNode] = d3Nodes.filter((n) => n.node.id === cn.id)
        changeNode.node = cn
      } else {
        d3Nodes = d3Nodes.concat(D3Helper.wrapNode(cn))
      }
    })
    setNodes(d3Nodes)
  }

  const updateRelations = (graphDelta: GraphDelta): void => {
    let d3Relations = relations.filter(
      (r) =>
        !Array.from(graphDelta.removedRelations ?? []).some(
          (id) => id === r.relation.id
        )
    )
    if (graphDelta)
      (graphDelta.changedRelations || []).forEach((cr) => {
        if (d3Relations.some((n) => n.relation.id === cr.id)) {
          const [changedRelation] = d3Relations.filter(
            (d3Rel) => d3Rel.relation.id === cr.id
          )
          changedRelation.relation = cr
        } else {
          d3Relations = d3Relations.concat(
            D3Helper.wrapRelation({
              sourceId: cr.sourceId || '',
              targetId: cr.targetId || '',
              ...cr,
            })
          )
        }
      })
    setRelations(d3Relations)
  }

  const updateState = (graphDelta: GraphDelta): void => {
    setDomains(
      domains
        .filter(
          (d) =>
            !Array.from(graphDelta.removedDomains ?? [])
              .concat(
                Array.from(graphDelta.changedDomains ?? []).map(
                  (changedDomain) => changedDomain.id || ''
                )
              )
              .some((id) => id === d.id)
        )
        .concat(Array.from(graphDelta.changedDomains ?? []))
    )
    updateNodes(graphDelta)
    updateRelations(graphDelta)
  }

  useEffect(() => {
    graphApi.fetchGraph().then((g) => {
      const gData = g.data
      if (gData.nodes) setNodes(gData.nodes.map((n) => D3Helper.wrapNode(n)))
      if (gData.relations)
        setRelations(
          gData.relations.map((n) =>
            D3Helper.wrapRelation({
              sourceId: n.sourceId || '',
              targetId: n.targetId || '',
              ...n,
            })
          )
        )
      if (gData.domains) setDomains(gData.domains)
    })
  }, [])

  const createRelation = (
    source: D3Node<Node>,
    target: D3Node<Node>,
    domain: Domain
  ): void => {
    const rel: Relation = {
      id: '',
      domainIds: [domain.id || ''],
      sourceId: source.node.id,
      targetId: target.node.id,
      multiple: false,
      primary: false,
      properties: [],
      type: '',
      color: 'red',
    }
    const d3Relation = D3Helper.wrapRelation({
      sourceId: rel.sourceId || '',
      targetId: rel.targetId || '',
      ...rel,
    })
    setSelected(d3Relation)
  }

  const drawSelectionIndicator = (
    svg: d3.Selection<d3.BaseType, unknown, HTMLElement, undefined>
  ):
    | Selection<BaseType | SVGPathElement, D3Node<Node>, SVGGElement, unknown>
    | undefined => {
    if (nodes && selectedDomain?.id) {
      const domainNodes = getVisibleNodes()
        .filter((n) => n && n.node && n.node.domainIds)
        .filter((n) => {
          return Array.from(n.node.domainIds ?? []).includes(
            selectedDomain?.id ?? ''
          )
        })
      if (domainNodes.length <= 0) {
        return undefined
      }

      return svg
        .append('g')
        .selectAll('path')
        .data(domainNodes)
        .join('path')
        .attr('id', (d: D3Node<Node>) => d.node.id ?? '')
        .attr('stroke-opacity', 0.7)
        .attr('stroke', (d: D3Node<Node>) => d.node.color ?? '#6d6a6e')
        .attr('fill', (d: D3Node<Node>) => d.node.color ?? '#6d6a6e')
        .attr('stroke-width', (n) =>
          Array.from(n.node.domainIds ?? []).includes(selectedDomain?.id ?? '')
            ? 20
            : 0
        )
        .classed('path', true)
    }
    return undefined
  }

  const relationMouseEvents = (
    relation: d3.Selection<
      d3.BaseType | SVGPathElement,
      D3Relation<Relation>,
      SVGGElement,
      unknown
    >
  ): void => {
    const click = (event: unknown, r: D3Relation<Relation>): void => {
      if (
        selected &&
        'relation' in selected &&
        selected.relation.id === r.relation.id
      ) {
        setSelected(undefined)
      } else {
        setSelected(r)
      }
    }
    relation.on('click', click)
  }

  const relationDrawEvents = (
    simulation: d3.Simulation<d3.SimulationNodeDatum, undefined>,
    selection: any
  ): void => {
    let source: D3Node<Node> | undefined
    const selectionDrag = d3
      .drag()
      .on('start', (e) => {
        simulation.restart()
        source = nodes.find((n) => {
          if (n.x && n.y) {
            return (
              D3Helper.pointDistance({ x: n.x ?? -1, y: n.y ?? -1 }, e) <
              n.radius
            )
          }
          return false
        })
      })
      .on('drag', (e, d: unknown): void => {
        const nodeX = source?.x ?? 0
        const nodeY = source?.y ?? 0
        const path = d as Path
        path.d = D3Helper.selectionPath(nodeX, nodeY, e.x - nodeX, e.y - nodeY)
        // }
        simulation.restart()
      })
      .on('end', (e, d: unknown) => {
        const path = d as Path
        delete path.d
        const target = nodes.filter((n) => {
          if (n.x && n.y) {
            return (
              D3Helper.pointDistance({ x: n.x ?? -1, y: n.y ?? -1 }, e) < 20
            )
          }
          return false
        })[0]
        if (source && target && selectedDomain) {
          createRelation(source, target, selectedDomain)
        }
        simulation.restart()
      })
    if (selection) {
      selection.call(selectionDrag)
    }
  }

  useEffect(() => {
    if (d3Container.current && nodes) {
      const svg = d3.select(d3Container.current)
      addSvgStyles(svg, width, height)

      const visibleNodes = getVisibleNodes()
      const visibleRelations = getVisibleRelations()

      let rels: D3Relation<Relation>[]
      if (selected && 'relation' in selected && selected.relation.id === '') {
        rels = visibleRelations.concat(selected)
      } else {
        rels = visibleRelations
      }

      rels.forEach((d3Rel) => {
        // eslint-disable-next-line no-param-reassign
        d3Rel.incomingRelationsCount = rels.filter(
          (r) =>
            r.relation.targetId === d3Rel.relation.sourceId &&
            r.relation.sourceId === d3Rel.relation.targetId
        ).length

        // eslint-disable-next-line no-param-reassign
        d3Rel.relCount = rels.filter(
          (r) =>
            r.relation.sourceId === d3Rel.relation.sourceId &&
            r.relation.targetId === d3Rel.relation.targetId
        ).length

        // eslint-disable-next-line no-param-reassign
        d3Rel.relIndex = rels
          .filter(
            (r) =>
              r.relation.sourceId === d3Rel.relation.sourceId &&
              r.relation.targetId === d3Rel.relation.targetId
          )
          .indexOf(d3Rel)
        if (d3Rel.relation.sourceId && d3Rel.relation.targetId)
          // eslint-disable-next-line no-param-reassign
          d3Rel.firstRender = d3Rel.relation.sourceId > d3Rel.relation.targetId
      })

      const relation = drawRelations<Relation>(
        svg,
        visibleRelations,
        rels,
        nodes,
        'relation',
        selectedDomain?.id
      )
      const selection = drawSelectionIndicator(svg)
      const node = drawNodes<Node>(
        svg,
        visibleNodes,
        'node',
        selectedDomain?.id
      )
      const nodeLabels = drawLabel<Node>(svg, visibleNodes, 'node')
      const simulation = buildSimulation<Relation, Node>(
        rels,
        visibleNodes,
        (): void => {
          // todo:
          if (selection) {
            selection.attr('d', (d) => {
              if (d.d) {
                return d.d
              }
              return D3Helper.selectionPath(
                d.x ?? 0,
                d.y ?? 0,
                d.x ?? 0,
                d.y ?? 0
              )
            })
          }
          tick<Node, Relation>(node, nodeLabels, relation, width, height)
        }
      )

      nodeMouseEvents(simulation, node, (e: unknown, d: D3Node<Node>): void => {
        if (selected && 'node' in selected && selected.node.id === d.node.id) {
          const force = d as Force
          delete force.fx
          delete force.fy
          setSelected(undefined)
        } else {
          setSelected(d)
        }
      })
      relationDrawEvents(simulation, selection)
      relationMouseEvents(relation)
    }
  }, [selectedDomain, domains, selected, nodes, relations, color, hideDomains])

  function downloadSVG(): void {
    if (d3Container.current && nodes) {
      const svg = d3.select(d3Container.current)
      const { innerHTML: svgData }: any = svg.node()
      const svgWidth =
        window.innerWidth - (openSidenav ? DRAWER_WIDTH_OPEN : DRAWER_WIDTH)
      const svgHeight = window.innerHeight
      // const svgData = document!.getElementById('svg')!.innerHTML
      const head = `<svg 
              viewBox="
              -${svgWidth / 2} 
              -${svgHeight / 2} 
              ${svgWidth} 
              ${svgHeight}"  
              title="graph" version="1.1" xmlns="http://www.w3.org/2000/svg">`
      const fullSvg = `${head + svgStyle + svgData}</svg>`

      const element = document.createElement('a')
      const file = new Blob([fullSvg], {
        type: 'text/plain',
      })
      element.href = URL.createObjectURL(file)
      element.download = 'graph.svg'
      document.body.appendChild(element) // Required for this to work in FireFox
      element.click()
    }
  }

  return (
    <>
      <DomainList domains={domains} updateState={updateState} />
      {selected?.kind === 'node' && (
        <NodeEdit
          node={(selected as D3Node<Node>).node}
          updateState={updateState}
        />
      )}
      {selected?.kind === 'relation' && (
        <RelationEdit
          relation={(selected as D3Relation<Relation>).relation}
          updateState={updateState}
        />
      )}
      <svg
        onClick={(): void => setSelected(undefined)}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
        }}
        width={
          window.innerWidth - (openSidenav ? DRAWER_WIDTH_OPEN : DRAWER_WIDTH)
        }
        height={window.innerHeight}
        ref={d3Container}
      />
      <DomainActions downloadSVG={() => downloadSVG()} />
    </>
  )
}
