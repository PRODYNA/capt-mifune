import { BaseType, Selection } from 'd3'
import * as d3 from 'd3'
import { QueryNode, QueryRelation } from '../pages/analytics/QueryBuilder'
import { D3Node, D3Relation } from '../pages/graph/D3Helper'
import { Node, Relation } from '../api/model/Model'

export function drawNodes<T extends Node | QueryNode>(
  svg: d3.Selection<d3.BaseType, unknown, HTMLElement, undefined>,
  data: D3Node<T>[],
  type: 'node' | 'queryNode',
  selectedDomainId?: T extends Node ? string : undefined
): Selection<BaseType | SVGCircleElement, D3Node<T>, SVGGElement, unknown> {
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

export function drawLabel<T extends Node | QueryNode>(
  svg: d3.Selection<d3.BaseType, unknown, HTMLElement, undefined>,
  data: D3Node<T>[],
  type: 'node' | 'queryNode'
): Selection<BaseType | SVGTextElement, D3Node<T>, SVGGElement, unknown> {
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

interface Force {
  fx?: number
  fy?: number
}

export function nodeMouseEvents<T extends Node | QueryNode>(
  simulation: d3.Simulation<d3.SimulationNodeDatum, undefined>,
  node: any,
  onClick: (e: any, d: D3Node<T>) => void
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

const color = (
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

export function drawRelations<T extends Relation | QueryRelation>(
  svg: d3.Selection<d3.BaseType, unknown, HTMLElement, undefined>,
  relations: D3Relation<T>[],
  d3Relation: D3Relation<T>[],
  data: D3Node<T extends Relation ? Node : QueryNode>[],
  type: 'relation' | 'queryRelation',
  selectedDomainId?: T extends Relation ? string : undefined
): d3.Selection<
  d3.BaseType | SVGPathElement,
  D3Relation<T>,
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
