import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Button, makeStyles } from '@material-ui/core'
import * as d3 from 'd3'
import { BaseType, Selection, svg } from 'd3'
import { v4 } from 'uuid'
import { D3Helper, D3Node, D3Relation } from '../graph/D3Helper'
import { Graph, Node, Relation } from '../../api/model/Model'
import graphService from '../../api/GraphService'

export interface QueryBuilderProps {
  onChange: (query: Query) => void
}

export interface Query {
  nodes: QueryNode[]
  relations: QueryRelation[]
}

export interface QueryNode {
  id: string
  varName: string
  node: Node
  selected: boolean
}

export interface QueryRelation {
  id: string
  varName: string
  relation: Relation
  selected: boolean
  sourceId: string
  targetId: string
}

export const QueryBuilder = (props: QueryBuilderProps): JSX.Element => {
  const { onChange } = props

  const height = 600

  const useStyle = makeStyles({
    svg: {
      border: '1px dashed grey',
    },
    'query-builder': {
      width: '100%',
    },
  })
  const classes = useStyle()
  const [width, setWidth] = useState<number>(100)
  const [graph, setGraph] = useState<Graph>()
  const [varCounter, setVarCounter] = useState<Map<string, number>>(new Map())
  const [selectActive, setSelectActive] = useState<boolean>(false)
  const [nodes, setNodes] = useState<D3Node<QueryNode>[]>([])
  const [relations, setRelations] = useState<D3Relation<QueryRelation>[]>([])
  const d3Container = useRef(null)

  React.useEffect(() => {
    const handleResize = (): void => {
      setWidth(document?.getElementById('query-builder')?.clientWidth ?? 100)
    }
    window.addEventListener('resize', handleResize)
  })

  useLayoutEffect(() => {
    setWidth(document?.getElementById('query-builder')?.clientWidth ?? 100)
  }, [])

  const color = (id: string): string => {
    return nodes.find((n) => n.node.node.id === id)?.node.node.color ?? 'green'
  }

  useEffect(() => {
    graphService.graphGet().then((g) => setGraph(g))
  }, [])

  function addPossibleNode(node: Node): D3Node<QueryNode> {
    const qNode: QueryNode = {
      id: v4(),
      varName: `${node.label}_${varCounter.get(node.label) ?? 1}`,
      node,
      selected: false,
    }
    const wrapNode = D3Helper.wrapNode(qNode)
    wrapNode.radius = 30
    return wrapNode
  }

  const addPossibleRelations = (d: D3Node<QueryNode>): void => {
    const possibleNodes: D3Node<QueryNode>[] = []
    const possibleRelations: QueryRelation[] = graphService
      .possibleRelations(graph!, d.node.node.id)
      .flatMap((r) => {
        const tmpRelations: QueryRelation[] = []
        if (r.targetId === d.node.node.id) {
          const [n] = graph!.nodes.filter(
            (tempNode) => r.sourceId === tempNode.id
          )
          const sourceNode = addPossibleNode(n)
          possibleNodes.push(sourceNode)
          tmpRelations.push({
            id: v4(),
            varName: `${r.type}_${varCounter.get(r.type) ?? 1}`,
            relation: r,
            sourceId: sourceNode.node.id,
            targetId: d.node.id,
            selected: false,
          })
        }
        if (r.sourceId === d.node.node.id) {
          const [n] = graph!.nodes.filter(
            (tempNode) => r.targetId === tempNode.id
          )
          const targetNode = addPossibleNode(n)
          possibleNodes.push(targetNode)
          tmpRelations.push({
            id: v4(),
            varName: `${r.type}_${varCounter.get(r.type) ?? 1}`,
            relation: r,
            sourceId: d.node.id,
            targetId: targetNode.node.id,
            selected: false,
          })
        }
        return tmpRelations
      })

    const activeNodes = nodes
      .filter((n) => n.node.selected)
      .concat(possibleNodes)
    setNodes(activeNodes)
    setRelations(
      relations
        .filter(
          (r) =>
            activeNodes.some((n) => n.node.id === r.relation.targetId) &&
            activeNodes.some((n) => n.node.id === r.relation.sourceId)
        )
        .concat(possibleRelations.map(D3Helper.wrapRelation))
    )
  }

  function cleanNodes(): void {
    const activeNodes = nodes.filter((n) => n.node.selected)

    setNodes(activeNodes)
    setRelations(
      relations.filter(
        (r) =>
          activeNodes.some((n) => n.node.id === r.relation.targetId) &&
          activeNodes.some((n) => n.node.id === r.relation.sourceId)
      )
    )
  }

  function updateCounterMap(
    map: Map<string, number>,
    activeRelations: D3Relation<QueryRelation>[],
    activeNodes: D3Node<QueryNode>[]
  ): void {
    activeRelations.forEach((r) =>
      map.set(
        r.relation.relation.type,
        activeRelations.filter(
          (ar) => ar.relation.relation.type === r.relation.relation.type
        ).length + 1
      )
    )
    activeNodes.forEach((n) =>
      map.set(
        n.node.node.label,
        activeNodes.filter((an) => an.node.node.label === n.node.node.label)
          .length + 1
      )
    )
    setVarCounter(map)
  }

  useEffect(() => {
    if (!d3Container.current) {
      return
    }
    const svgSelect = d3.select(d3Container.current)
    svgSelect.selectAll('*').remove()

    svgSelect.append('style').text(`
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

    svgSelect.attr('viewBox', `${-width / 2},${-height / 2},${width},${height}`)

    if (nodes && nodes?.length <= 0) {
      console.error('no nodes exist')
    }

    const drawNodes = (
      svgSection: d3.Selection<d3.BaseType, unknown, HTMLElement, undefined>,
      queryNodes: D3Node<QueryNode>[]
    ): Selection<
      BaseType | SVGTextElement,
      D3Node<QueryNode>,
      SVGGElement,
      unknown
    > => {
      return svgSection
        .append('g')
        .attr('stroke', '#fff')
        .selectAll('circle')
        .data(queryNodes || [])
        .join('circle')
        .attr('r', (n) => n.radius)
        .attr('fill', (n) => n.node.node.color)
        .attr('fill-opacity', (n) => (n.node.selected ? 1 : 0.4))
        .classed('node', true)
    }

    const drawNodeLabel = (
      svgSection: d3.Selection<d3.BaseType, unknown, HTMLElement, undefined>,
      queryNodes: D3Node<QueryNode>[]
    ): Selection<
      BaseType | SVGTextElement,
      D3Node<QueryNode>,
      SVGGElement,
      unknown
    > => {
      return svgSection
        .append('g')
        .selectAll('text')
        .data(queryNodes)
        .join('text')
        .text((d) => d.node.varName)
        .attr('dominant-baseline', 'middle')
        .attr('text-anchor', 'middle')
        .attr('class', 'node-label')
        .attr('background-color', (n) => n.node.node.color)
    }

    const drawRelations = (
      svgSelection: d3.Selection<d3.BaseType, unknown, HTMLElement, undefined>,
      queryRelations: D3Relation<QueryRelation>[]
    ): d3.Selection<
      d3.BaseType | SVGPathElement,
      D3Relation<QueryRelation>,
      SVGGElement,
      unknown
    > => {
      relations.forEach((rel) => {
        svgSelection
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
          .attr('fill', color(rel.relation.relation.sourceId))
      })

      const selection = svgSelection
        .append('g')
        .selectAll('path')
        .data(queryRelations)
      const relation = selection
        .join('path')
        .attr('id', (d) => d.relation.id)
        .attr('stroke-linecap', 'round')
        .attr('opacity', (r) => {
          if (r.relation.selected) {
            return 1
          }
          return 0.4
        })
        .attr('stroke', (d) => color(d.relation.relation.sourceId))
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
        .text((d) => d.relation.varName)
        .attr('class', 'relation-label')
      return relation
    }

    const nodeMouseEvents = (
      simulation: d3.Simulation<d3.SimulationNodeDatum, undefined>,
      node: any
    ): void => {
      const dragstart = (): void => {}
      const dragged = (event: any, element: any): void => {
        // eslint-disable-next-line no-param-reassign
        element.fx = event.x
        // eslint-disable-next-line no-param-reassign
        element.fy = event.y
        simulation.alphaTarget(0.3).restart()
      }
      const dragend = (): void => {
        simulation.stop()
      }

      const click = (event: any, d3Node: D3Node<QueryNode>): void => {
        if (d3Node.node.selected) {
          setSelectActive(true)
          addPossibleRelations(d3Node)
        } else {
          // eslint-disable-next-line no-param-reassign
          d3Node.node.selected = true
          setSelectActive(false)
          const activeNodes = nodes.filter((n) => n.node.selected)
          setNodes(activeNodes)
          const activeRelations = relations
            .map((r) => {
              // eslint-disable-next-line no-param-reassign
              r.relation.selected = true
              return r
            })
            .filter(
              (r) =>
                activeNodes.some((n) => n.node.id === r.relation.targetId) &&
                activeNodes.some((n) => n.node.id === r.relation.sourceId)
            )
          setRelations(activeRelations)
          updateCounterMap(varCounter, activeRelations, activeNodes)

          onChange({
            nodes: activeNodes.map((n) => n.node),
            relations: activeRelations.map((r) => r.relation),
          })
        }
        if (!graph) {
          return
        }

        simulation.alphaTarget(0.3).restart()
      }

      const drag = d3
        .drag()
        .on('start', dragstart)
        .on('drag', dragged)
        .on('end', dragend)
      node.call(drag).on('click', click)
    }

    const buildSimulation = (
      tick: () => void
    ): d3.Simulation<d3.SimulationNodeDatum, undefined> => {
      return d3
        .forceSimulation()
        .nodes(nodes)
        .force('charge', d3.forceManyBody().strength(0.1))
        .force(
          'link',
          d3
            .forceLink<D3Node<QueryNode>, D3Relation<QueryRelation>>(relations)
            .id((d) => d.node.id)
            .distance(100)
            .strength(0.3)
        )
        .force('collision', d3.forceCollide().radius(100).strength(0.8))
        .force('x', d3.forceX().strength(0.1))
        .force('y', d3.forceY().strength(0.1))
        .on('tick', tick)
    }

    const relation = drawRelations(svgSelect, relations)
    const node = drawNodes(svgSelect, nodes)
    const labels = drawNodeLabel(svgSelect, nodes)

    const tick = (): void => {
      node.attr('cx', (d) => d.x ?? null).attr('cy', (d) => d.y ?? null)
      labels.attr('x', (d) => d.x ?? null).attr('y', (d) => d.y ?? null)
      relation
        .attr('d', (rel) => {
          return D3Helper.buildRelationPath(rel)
        })
        .attr('marker-end', (r) =>
          D3Helper.isFlipped(r) ? '' : `url(#arrow-${r.relation.id})`
        )
        .attr('marker-start', (r) =>
          D3Helper.isFlipped(r) ? `url(#arrow-${r.relation.id})` : ''
        )
    }

    const simulation = buildSimulation(tick)
    nodeMouseEvents(simulation, node)
  }, [nodes, relations, selectActive])

  const addNode = (node: Node): void => {
    console.log('add node')
    const qNode: QueryNode = {
      id: v4(),
      varName: `${node.label}_${1}`,
      node,
      selected: true,
    }
    const newNode = D3Helper.wrapNode(qNode)
    newNode.radius = 40
    newNode.x = 100
    newNode.y = 100
    setNodes([newNode])
    setRelations([])
    updateCounterMap(new Map(), [], [newNode])
  }

  return (
    <div id="query-builder">
      <h1>Query Builder</h1>
      {graph?.nodes.map((n) => (
        <Button onClick={() => addNode(n)}>{n.label}</Button>
      ))}
      <div>
        {JSON.stringify(varCounter)}
        <svg
          onClick={(e) => {
            cleanNodes()
            setSelectActive(false)
          }}
          className={classes.svg}
          width={width}
          height={height}
          ref={d3Container}
        />
      </div>
    </div>
  )
}
