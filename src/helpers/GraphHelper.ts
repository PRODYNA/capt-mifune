import { BaseType, Selection } from 'd3'
import * as d3 from 'd3'
import { QueryNode, QueryRelation } from '../pages/analytics/QueryBuilder'
import { D3Helper, D3Node, D3Relation } from './D3Helper'
import { Node, Relation } from '../services/models'
import { Force } from '../pages/graph/Graph'

export function drawNodes<N extends Node | QueryNode>(
  svg: d3.Selection<d3.BaseType, unknown, HTMLElement, undefined>,
  data: D3Node<N>[],
  type: 'node' | 'queryNode',
  selectedDomainId?: N extends Node ? string : undefined
): Selection<BaseType | SVGCircleElement, D3Node<N>, SVGGElement, unknown> {
  return svg
    .append('g')
    .selectAll('circle')
    .data(data)
    .join('circle')
    .attr('r', (n) => n.radius)
    .attr('stroke', (n) =>
      type === 'node'
        ? (n as D3Node<Node>).node.color || '#fff'
        : (n as D3Node<QueryNode>).node.node.color || '#fff'
    )
    .attr('stroke-width', 2)
    .attr('fill', (n) =>
      type === 'node'
        ? (n as D3Node<Node>).node.color || ''
        : (n as D3Node<QueryNode>).node.node.color || ''
    )
    .attr('opacity', (n) => {
      if (type === 'node') {
        return Array.from((n as D3Node<Node>).node.domainIds ?? []).some(
          (id) => selectedDomainId === id
        ) || !selectedDomainId
          ? 1
          : 0.4
      }
      return (n as D3Node<QueryNode>).node.selected ? 1 : 0.4
    })
    .classed('node', true)
}

export function drawLabel<N extends Node | QueryNode>(
  svg: d3.Selection<d3.BaseType, unknown, HTMLElement, undefined>,
  data: D3Node<N>[],
  type: 'node' | 'queryNode'
): Selection<BaseType | SVGTextElement, D3Node<N>, SVGGElement, unknown> {
  return svg
    .append('g')
    .selectAll('text')
    .data(data)
    .join('text')
    .text((d) =>
      type === 'node'
        ? (d as D3Node<Node>).node.label || ''
        : (d as D3Node<QueryNode>).node.varName || ''
    )
    .attr('dominant-baseline', 'middle')
    .attr('text-anchor', 'middle')
    .attr('class', 'node-label')
    .attr('background-color', (n) =>
      type === 'node'
        ? (n as D3Node<Node>).node.color || ''
        : (n as D3Node<QueryNode>).node.node.color || ''
    )
}

export function nodeMouseEvents<N extends Node | QueryNode>(
  simulation: d3.Simulation<d3.SimulationNodeDatum, undefined>,
  node: any,
  onClick: (e: any, d: D3Node<N>) => void
): void {
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

  const drag = d3
    .drag()
    .on('start', dragstart)
    .on('drag', dragged)
    .on('end', dragend)
  node.call(drag).on('click', onClick)
}

export const color = (
  type: 'node' | 'queryNode',
  data: D3Node<Node | QueryNode>[],
  id: string
): string => {
  if (type === 'node') {
    return (
      (data as D3Node<Node>[]).find((n) => n.node.id === id)?.node.color ??
      'green'
    )
  }
  return (
    (data as D3Node<QueryNode>[]).find((n) => n.node.node.id === id)?.node.node
      .color ?? 'green'
  )
}

export function drawRelations<R extends Relation | QueryRelation>(
  svg: d3.Selection<d3.BaseType, unknown, HTMLElement, undefined>,
  relations: D3Relation<R>[],
  d3Relation: D3Relation<R>[],
  data: D3Node<R extends Relation ? Node : QueryNode>[],
  type: 'relation' | 'queryRelation',
  selectedDomainId?: R extends Relation ? string : undefined
): d3.Selection<
  d3.BaseType | SVGPathElement,
  D3Relation<R>,
  SVGGElement,
  unknown
> {
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
      .attr(
        'fill',
        color(
          type === 'relation' ? 'node' : 'queryNode',
          data,
          type === 'relation'
            ? (rel as D3Relation<Relation>).relation.sourceId || ''
            : (rel as D3Relation<QueryRelation>).relation.relation.sourceId ||
                ''
        )
      )
  })

  const selection = svg.append('g').selectAll('path').data(d3Relation)
  const relation = selection
    .join('path')
    .attr('id', (d) => d.relation.id || '')
    .attr('stroke-linecap', 'round')
    .attr('opacity', (r) => {
      if (type === 'relation') {
        return Array.from(
          (r as D3Relation<Relation>).relation.domainIds ?? []
        ).some((id) => id === selectedDomainId) || !selectedDomainId
          ? 1
          : 0.4
      }
      return (r as D3Relation<QueryRelation>).relation.selected ? 1 : 0.4
    })
    .attr('stroke', (d) =>
      color(
        type === 'relation' ? 'node' : 'queryNode',
        data,
        type === 'relation'
          ? (d as D3Relation<Relation>).relation.sourceId || ''
          : (d as D3Relation<QueryRelation>).relation.relation.sourceId || ''
      )
    )
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
    .text((d) => {
      if (type === 'relation') {
        const castValue = d as D3Relation<Relation>
        return (
          castValue.relation.type +
          (castValue.relation.multiple ? ' [ ]' : '') +
          (castValue.relation.primary ? ' *' : '')
        )
      }
      const queryRel = d as D3Relation<QueryRelation>
      return `${queryRel.relation.varName} * ${queryRel.relation.depth}`
    })

    .attr('class', 'relation-label')
  return relation
}

export const svgStyle = `  
        .node {
          filter: drop-shadow( 3px 3px 3px rgba(0, 0, 0, .2));
        }
        .relation {
          filter: drop-shadow( 3px 3px 3px rgba(0, 0, 0, .2));
        }
        .relation-label { 
            font-size: 14px;
            fill: black; 
            cursor: default;
            font-weight: bold;
            pointer-events: none;
            -webkit-font-smoothing: antialiased;
             text-shadow: 1px 1px 0 #FFF,
            -1px -1px 0 #FFF,
            1px -1px 0 #FFF,
            -1px 1px 0 #FFF,
            0px 1px 0 #FFF,
            1px 0px 0 #FFF,
            0px -1px 0 #FFF,
            -1px 0px 0 #FFF;
        }
        .node-label {
            font-size: 14px;
            fill: black; 
            font-weight: bold;
            cursor: default;
            pointer-events: none;
            -webkit-font-smoothing: antialiased;
            text-shadow: 1px 1px 0 #FFF,
            -1px -1px 0 #FFF,
            1px -1px 0 #FFF,
            -1px 1px 0 #FFF,
            0px 1px 0 #FFF,
            1px 0px 0 #FFF,
            0px -1px 0 #FFF,
            -1px 0px 0 #FFF;
        }`

export function addSvgStyles(
  svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>,
  width: number,
  height: number
): void {
  svg.selectAll('*').remove()
  svg.append('style').text(`
      ${svgStyle}
      `)
  svg.attr('viewBox', `${-width / 2},${-height / 2},${width},${height}`)
}

export function tick<
  N extends Node | QueryNode,
  R extends Relation | QueryRelation
>(
  node: d3.Selection<
    d3.BaseType | SVGCircleElement,
    D3Node<N>,
    SVGGElement,
    unknown
  >,
  labels: d3.Selection<
    d3.BaseType | SVGTextElement,
    D3Node<N>,
    SVGGElement,
    unknown
  >,
  relation: d3.Selection<
    d3.BaseType | SVGPathElement,
    D3Relation<R>,
    SVGGElement,
    unknown
  >
): void {
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

export function buildSimulation<
  R extends Relation | QueryRelation,
  N extends Node | QueryNode
>(
  d3Relation: D3Relation<R>[],
  data: D3Node<N>[],
  onTick: () => void
): d3.Simulation<d3.SimulationNodeDatum, undefined> {
  return d3
    .forceSimulation()
    .nodes(data)
    .force('charge', d3.forceManyBody().strength(0.1))
    .force(
      'link',
      d3
        .forceLink<D3Node<N>, D3Relation<R>>(d3Relation)
        .id((d) => d.node.id as string)
        .distance(100)
        .strength(0.2)
    )
    .force('collision', d3.forceCollide().radius(100).strength(0.4))
    .force('x', d3.forceX().strength(0.1))
    .force('y', d3.forceY().strength(0.1))
    .on('tick', onTick)
}
