import { BaseType, Selection } from 'd3'
import * as d3 from 'd3'
import { QueryNode, QueryRelation } from '../pages/analytics/QueryBuilder'
import { D3Helper, D3Node, D3Relation } from '../pages/graph/D3Helper'
import { Node, Relation } from '../api/model/Model'
import { Force } from '../pages/graph/Graph'

export function drawNodes<N extends Node | QueryNode>(
  svg: d3.Selection<d3.BaseType, unknown, HTMLElement, undefined>,
  data: D3Node<N>[],
  type: 'node' | 'queryNode',
  selectedDomainId?: N extends Node ? string : undefined
): Selection<BaseType | SVGCircleElement, D3Node<N>, SVGGElement, unknown> {
  return svg
    .append('g')
    .attr('stroke', '#fff')
    .attr('stroke-width', 1.5)
    .selectAll('circle')
    .data(data)
    .join('circle')
    .attr('r', (n) => n.radius)
    .attr('fill', (n) =>
      type === 'node'
        ? (n as D3Node<Node>).node.color
        : (n as D3Node<QueryNode>).node.node.color
    )
    .attr('opacity', (n) => {
      if (type === 'node') {
        return (n as D3Node<Node>).node.domainIds.some(
          (id) => selectedDomainId === id
        )
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
        ? (d as D3Node<Node>).node.label
        : (d as D3Node<QueryNode>).node.varName
    )
    .attr('dominant-baseline', 'middle')
    .attr('text-anchor', 'middle')
    .attr('class', 'node-label')
    .attr('background-color', (n) =>
      type === 'node'
        ? (n as D3Node<Node>).node.color
        : (n as D3Node<QueryNode>).node.node.color
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
            ? (rel as D3Relation<Relation>).relation.sourceId
            : (rel as D3Relation<QueryRelation>).relation.relation.sourceId
        )
      )
  })

  const selection = svg.append('g').selectAll('path').data(d3Relation)
  const relation = selection
    .join('path')
    .attr('id', (d) => d.relation.id)
    .attr('stroke-linecap', 'round')
    .attr('opacity', (r) => {
      if (type === 'relation') {
        return (r as D3Relation<Relation>).relation.domainIds.some(
          (id) => id === selectedDomainId
        )
      }
      return (r as D3Relation<QueryRelation>).relation.selected ? 1 : 0.4
    })
    .attr('stroke', (d) =>
      color(
        type === 'relation' ? 'node' : 'queryNode',
        data,
        type === 'relation'
          ? (d as D3Relation<Relation>).relation.sourceId
          : (d as D3Relation<QueryRelation>).relation.relation.sourceId
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
          (castValue.relation.multiple ? ' []' : '') +
          (castValue.relation.primary ? '*' : '')
        )
      }
      return (d as D3Relation<QueryRelation>).relation.varName
    })

    .attr('class', 'relation-label')
  return relation
}

export function addSvgStyles(
  svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>,
  width: number,
  height: number
): void {
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
