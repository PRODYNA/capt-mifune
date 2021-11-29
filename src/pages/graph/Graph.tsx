import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { BaseType, Selection } from 'd3'
import { NodeEdit } from './NodeEdit'
import { Domain, GraphDelta, Node, Relation } from '../../api/model/Model'
import { RelationEdit } from './RelationEdit'
import graphService from '../../api/GraphService'
import { DomainList } from '../domain/DomainList'
import { D3Helper, D3Node, D3Relation } from './D3Helper'
import {
  DRAWER_WIDTH,
  DRAWER_WIDTH_OPEN,
} from '../../components/Navigation/SideNavigation'
import CreateDomain from '../domain/CreateDomain'
import GraphContext from '../../context/GraphContext'

interface IGraph {
  openSidenav: boolean
}

interface Force {
  fx?: number
  fy?: number
}
interface Path {
  d?: string
}

/* Component */
export const Graph = (props: IGraph): JSX.Element => {
  const { openSidenav } = props
  const [width, setWidth] = useState<number>(800)
  const [height, setHeight] = useState<number>(600)
  const [selectedDomain, setSelectedDomain] = useState<Domain>()
  const [domains, setDomains] = useState<Domain[]>([])
  const [nodes, setNodes] = useState<D3Node<Node>[]>([])
  const [relations, setRelations] = useState<D3Relation<Relation>[]>([])
  const [selected, setSelected] = useState<
    D3Node<Node> | D3Relation<Relation>
  >()
  const d3Container = useRef(null)

  const nodeRadius = (n: D3Node<Node>): number => {
    const isSelected =
      selected && 'node' in selected && selected.node.id === n.node.id
    if (isSelected) {
      return 40
    }
    if (n.node.domainIds.some((id) => id === selectedDomain?.id)) {
      return 40
    }
    return 30
  }

  const relWidth = (rel: D3Relation<Relation>): number => {
    const isSelected =
      selected &&
      'relation' in selected &&
      selected.relation.id === rel.relation.id
    if (isSelected) {
      return 14
    }
    if (rel.relation.domainIds.some((id) => id === selectedDomain?.id)) {
      return 10
    }
    return 6
  }

  React.useEffect(() => {
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

  useEffect(() => {
    const handleResize = (): void => {
      setWidth(window.innerWidth)
      setHeight(window.innerHeight)
    }
    window.addEventListener('resize', handleResize)
  })

  useLayoutEffect(() => {
    setWidth(window.innerWidth)
    setHeight(window.innerHeight)
  }, [])

  const updateNodes = (graphDelta: GraphDelta): void => {
    let d3Nodes = nodes.filter(
      (n) => !graphDelta.removedNodes.some((id) => id === n.node.id)
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
      (r) => !graphDelta.removedRelations.some((id) => id === r.relation.id)
    )
    graphDelta.changedRelations.forEach((cr) => {
      if (d3Relations.some((n) => n.relation.id === cr.id)) {
        const [changedRelation] = d3Relations.filter(
          (d3Rel) => d3Rel.relation.id === cr.id
        )
        changedRelation.relation = cr
      } else {
        d3Relations = d3Relations.concat(D3Helper.wrapRelation(cr))
      }
    })
    setRelations(d3Relations)
  }

  const updateState = (graphDelta: GraphDelta): void => {
    setDomains(
      domains
        .filter(
          (d) =>
            !graphDelta.removedDomains
              .concat(
                graphDelta.changedDomains.map(
                  (changedDomain) => changedDomain.id
                )
              )
              .some((id) => id === d.id)
        )
        .concat(graphDelta.changedDomains)
    )
    updateNodes(graphDelta)
    updateRelations(graphDelta)
  }

  const color = (id: string): string => {
    return nodes.find((n) => n.node.id === id)?.node.color ?? 'green'
  }

  useEffect(() => {
    graphService.graphGet().then((g) => {
      setNodes(g.nodes.map((n) => D3Helper.wrapNode(n)))
      setRelations(g.relations.map((n) => D3Helper.wrapRelation(n)))
      setDomains(g.domains)
    })
  }, [])

  useEffect(() => {
    const createRelation = (
      source: D3Node<Node>,
      target: D3Node<Node>,
      domain: Domain
    ): void => {
      const rel: Relation = {
        id: '',
        domainIds: [domain.id],
        sourceId: source.node.id,
        targetId: target.node.id,
        multiple: false,
        primary: false,
        properties: [],
        type: '',
        color: 'red',
      }
      const d3Relation = D3Helper.wrapRelation(rel)
      setSelected(d3Relation)
    }

    const drawNodes = (
      svg: d3.Selection<d3.BaseType, unknown, HTMLElement, undefined>
    ): Selection<
      BaseType | SVGCircleElement,
      D3Node<Node>,
      SVGGElement,
      unknown
    > => {
      return svg
        .append('g')
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5)
        .selectAll('circle')
        .data(nodes)
        .join('circle')
        .attr('r', (n) => n.radius)
        .attr('fill', (n) => n.node.color)
        .attr('opacity', (n) =>
          n.node.domainIds.some((id) => selectedDomain?.id === id) ? 1 : 0.4
        )
        .classed('node', true)
    }

    const drawNodeLabel = (
      svg: d3.Selection<d3.BaseType, unknown, HTMLElement, undefined>
    ): Selection<
      BaseType | SVGTextElement,
      D3Node<Node>,
      SVGGElement,
      unknown
    > => {
      return svg
        .append('g')
        .selectAll('text')
        .data(nodes)
        .join('text')
        .text((d) => d.node.label)
        .attr('dominant-baseline', 'middle')
        .attr('text-anchor', 'middle')
        .attr('class', 'node-label')
        .attr('background-color', (n) => n.node.color)
    }

    const drawSelectionIndicator = (
      svg: d3.Selection<d3.BaseType, unknown, HTMLElement, undefined>
    ):
      | Selection<BaseType | SVGPathElement, D3Node<Node>, SVGGElement, unknown>
      | undefined => {
      if (selected && 'node' in selected && selected.node.id) {
        const selectedNode = selected as D3Node<Node>
        return svg
          .append('g')
          .selectAll('path')
          .data([selectedNode])
          .join('path')
          .attr('id', (d) => d.node.id)
          .attr('stroke-opacity', 0.7)
          .attr('stroke', (d) => d.node.color)
          .attr('fill', (d) => d.node.color)
          .attr('stroke-width', 20)
          .classed('path', true)
      }
      return undefined
    }

    const drawRelations = (
      svg: d3.Selection<d3.BaseType, unknown, HTMLElement, undefined>,
      d3Relation: D3Relation<Relation>[]
    ): d3.Selection<
      d3.BaseType,
      D3Relation<Relation>,
      SVGGElement,
      unknown
    > => {
      relations.forEach((rel) => {
        svg
          .append('defs')
          .append('marker')
          .attr('id', `arrow-${rel.relation.id}`)
          .attr('markerWidth', '3')
          .attr('markerHeight', '2')
          .attr('refX', '1')
          .attr('refY', '1')
          .attr('orient', 'auto-start-reverse')
          .append('polygon')
          .attr('points', '0 2, 0 0, 3 1')
          .attr('fill', color(rel.relation.sourceId))
      })

      const selection = svg.append('g').selectAll('path').data(d3Relation)
      const relation = selection
        .join('path')
        .attr('id', (d) => d.relation.id)
        .attr('stroke-linecap', 'round')
        .attr('opacity', (r) => {
          if (r.relation.domainIds.some((id) => id === selectedDomain?.id)) {
            return 1
          }
          return 0.4
        })
        .attr('stroke', (d) => color(d.relation.sourceId))
        .attr('fill', 'transparent')
        .attr('stroke-width', (rel) => rel.width)
        .classed('relation', true)

      selection
        .join('text')
        .attr('dominant-baseline', 'middle')
        .append('textPath')
        .attr('startOffset', '50%')
        .attr('text-anchor', 'middle')
        .attr('href', (d) => `#${d.relation.id}`)
        .text(
          (d) =>
            d.relation.type +
            (d.relation.multiple ? ' []' : '') +
            (d.relation.primary ? '*' : '')
        )

        .attr('class', 'relation-label')
      return relation
    }

    const nodeMouseEvents = (
      simulation: d3.Simulation<d3.SimulationNodeDatum, undefined>,
      node: any
    ): void => {
      const dragstart = (): void => {}
      const dragged = (
        event: { x: number; y: number },
        d: Force | unknown
      ): void => {
        const force = d as Force
        force.fx = event.x
        force.fy = event.y
        simulation.alphaTarget(0.3).restart()
      }
      const dragend = (): void => {
        simulation.stop()
      }

      const click = (e: any, d: D3Node<Node>): void => {
        if (selected && 'node' in selected && selected.node.id === d.node.id) {
          const force = d as Force
          delete force.fx
          delete force.fy
          setSelected(undefined)
        } else {
          setSelected(d)
        }
      }

      const drag = d3
        .drag()
        .on('start', dragstart)
        .on('drag', dragged)
        .on('end', dragend)
      node.call(drag).on('click', click)
    }

    const relationMouseEvents = (
      relation: d3.Selection<
        d3.BaseType | SVGPathElement,
        D3Relation<Relation>,
        SVGGElement,
        unknown
      >
    ): void => {
      const click = (event: any, r: D3Relation<Relation>): void => {
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
      const selectionDrag = d3
        .drag()
        .on('start', () => {
          simulation.restart()
        })
        .on('drag', (e: any, d: unknown): void => {
          if (selected && 'node' in selected && selected.node.id) {
            const node: D3Node<Node> = selected as D3Node<Node>
            const nodeX = node.x ?? 0
            const nodeY = node.y ?? 0
            const path = d as Path
            path.d = D3Helper.selectionPath(
              nodeX,
              nodeY,
              e.x - nodeX,
              e.y - nodeY
            )
          }
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
          if (selected?.kind === 'node' && target && selectedDomain) {
            const source = selected as D3Node<Node>
            createRelation(source, target, selectedDomain)
          }
          simulation.restart()
        })
      if (selection) {
        selection.call(selectionDrag)
      }
    }

    const buildSimulation = (
      d3Relation: D3Relation<Relation>[],
      tick: () => void
    ): d3.Simulation<d3.SimulationNodeDatum, undefined> => {
      return d3
        .forceSimulation()
        .nodes(nodes)
        .force('charge', d3.forceManyBody().strength(0.1))
        .force(
          'link',
          d3
            .forceLink<D3Node<Node>, D3Relation<Relation>>(d3Relation)
            .id((d) => d.node.id)
            .distance(100)
            .strength(0.1)
        )
        .force('collision', d3.forceCollide().radius(100).strength(0.8))
        .force('x', d3.forceX().strength(0.1))
        .force('y', d3.forceY().strength(0.3))
        .on('tick', tick)
    }

    if (d3Container.current && nodes) {
      const svg = d3.select(d3Container.current)
      svg.selectAll('*').remove()
      svg.append('style').text(`
            .node {
              filter: drop-shadow( 3px 3px 2px rgba(0, 0, 0, .7));
            }
            .relation {
              filter: drop-shadow( 3px 3px 2px rgba(0, 0, 0, .7));
            }
            .relation-label { 
                font: bold 13px sans-serif; 
                fill: white; 
                text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
                cursor: default;
                pointer-events: none;
            }
            .node-label {
                font: bold 13px sans-serif; 
                fill: white; 
                text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
                cursor: default;
                pointer-events: none;
            }
          `)
      let rels: D3Relation<Relation>[]
      if (selected && 'relation' in selected && selected.relation.id === '') {
        rels = relations.concat(selected)
      } else {
        rels = relations
      }

      rels.forEach((d3Rel) => {
        // eslint-disable-next-line no-param-reassign
        d3Rel.incomingRelationsCount = 0
      })

      rels.forEach((r) => {
        // eslint-disable-next-line no-param-reassign
        r.incomingRelationsCount = rels.filter(
          (r2) =>
            r2.relation.targetId === r.relation.sourceId &&
            r2.relation.sourceId === r.relation.targetId
        ).length
      })

      rels.forEach((r) => {
        // eslint-disable-next-line no-param-reassign
        r.relCount = rels.filter(
          (r2) =>
            r2.relation.sourceId === r.relation.sourceId &&
            r2.relation.targetId === r.relation.targetId
        ).length

        // eslint-disable-next-line no-param-reassign
        r.relIndex = rels
          .filter(
            (r2) =>
              r2.relation.sourceId === r.relation.sourceId &&
              r2.relation.targetId === r.relation.targetId
          )
          .indexOf(r)

        // eslint-disable-next-line no-param-reassign
        r.firstRender = r.relation.sourceId > r.relation.targetId
      })

      svg.attr('viewBox', `${-width / 2},${-height / 2},${width},${height}`)
      const relation = drawRelations(svg, rels)
      const selection = drawSelectionIndicator(svg)
      const node = drawNodes(svg)
      const text = drawNodeLabel(svg)

      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      const tick = () => {
        // todo:
        if (selection && selected && selected.kind === 'node') {
          // const selectedNode = selected as D3Node<Node>
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

        node.attr('cx', (d) => d.x ?? null).attr('cy', (d) => d.y ?? null)
        text.attr('x', (d) => d.x ?? null).attr('y', (d) => d.y ?? null)
        relation
          .attr('marker-end', (r) =>
            D3Helper.isFlipped(r) ? '' : `url(#arrow-${r.relation.id})`
          )
          .attr('marker-start', (r) =>
            D3Helper.isFlipped(r) ? `url(#arrow-${r.relation.id})` : ''
          )
        relation.attr('d', (rel) => {
          return D3Helper.buildRelationPath(rel)
        })
      }

      const simulation = buildSimulation(rels, tick)
      nodeMouseEvents(simulation, node)
      relationDrawEvents(simulation, selection)
      relationMouseEvents(relation)
    }
  }, [selectedDomain, domains, selected, nodes, relations, color])

  const editSection = (): JSX.Element => {
    if (selected?.kind === 'node') {
      return (
        <NodeEdit
          node={(selected as D3Node<Node>).node}
          updateState={updateState}
        />
      )
    }
    if (selected?.kind === 'relation') {
      return (
        <RelationEdit
          relation={(selected as D3Relation<Relation>).relation}
          updateState={updateState}
        />
      )
    }
    return <></>
  }

  return (
    <GraphContext.Provider
      value={{
        selectedDomain,
        setSelectedDomain,
        domains,
        setDomains,
        selected,
        setSelected: (v): void => setSelected(v),
        nodes,
        setNodes: (v): void => setNodes(v),
        relations,
        setRelations,
      }}
    >
      <DomainList domains={domains} updateState={updateState} />
      {editSection()}
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
      <CreateDomain
        domains={domains}
        setSelectedDomain={setSelectedDomain}
        setDomains={setDomains}
      />
    </GraphContext.Provider>
  )
}
