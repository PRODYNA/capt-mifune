import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Button, makeStyles } from '@material-ui/core'
import * as d3 from 'd3'
import { v4 } from 'uuid'
import { D3Helper, D3Node, D3Relation } from '../../helpers/D3Helper'
import { Graph, Node, Relation } from '../../api/model/Model'
import graphService from '../../api/GraphService'
import {
  addSvgStyles,
  buildSimulation,
  drawLabel,
  drawNodes,
  drawRelations,
  nodeMouseEvents,
  tick,
} from '../../helpers/GraphHelper'

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

  useEffect(() => {
    const handleResize = (): void => {
      setWidth(document?.getElementById('query-builder')?.clientWidth ?? 100)
    }
    window.addEventListener('resize', handleResize)
  })

  useLayoutEffect(() => {
    setWidth(document?.getElementById('query-builder')?.clientWidth ?? 100)
  }, [])

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
    addSvgStyles(svgSelect, width, height)

    if (nodes && nodes?.length <= 0) {
      console.error('no nodes exist')
    }

    const relation = drawRelations<QueryRelation>(
      svgSelect,
      relations,
      relations,
      nodes,
      'queryRelation'
    )
    const node = drawNodes<QueryNode>(svgSelect, nodes, 'queryNode')
    const labels = drawLabel<QueryNode>(svgSelect, nodes, 'queryNode')
    const simulation = buildSimulation<QueryRelation, QueryNode>(
      relations,
      nodes,
      (): void => tick<QueryNode, QueryRelation>(node, labels, relation)
    )

    nodeMouseEvents(
      simulation,
      node,
      (event: any, d3Node: D3Node<QueryNode>): void => {
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
    )
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
          onClick={() => {
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
