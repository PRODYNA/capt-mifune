import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Box, Chip, Collapse, Switch, Typography } from '@material-ui/core'
import * as d3 from 'd3'
import { v4 } from 'uuid'
import { D3Helper, D3Node, D3Relation } from '../../helpers/D3Helper'
import { Graph, Node, Relation } from '../../services/models'
import {
  addSvgStyles,
  buildSimulation,
  drawLabel,
  drawNodes,
  drawRelations,
  nodeMouseEvents,
  tick,
} from '../../helpers/GraphHelper'
import CustomButton from '../../components/Button/CustomButton'
import { GraphApi } from '../../services'
import AXIOS_CONFIG from '../../openapi/axios-config'

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
  depth: '1' | 'n'
  selected: boolean
  sourceId: string
  targetId: string
}

export const QueryBuilder = (props: QueryBuilderProps): JSX.Element => {
  const { onChange } = props
  const height = 800
  const [width, setWidth] = useState<number>(100)
  const [graph, setGraph] = useState<Graph>()
  const [varCounter, setVarCounter] = useState<Map<string, number>>(new Map())
  const [selectActive, setSelectActive] = useState<boolean>(false)
  const [nodes, setNodes] = useState<D3Node<QueryNode>[]>([])
  const [relations, setRelations] = useState<D3Relation<QueryRelation>[]>([])
  const [showQuery, setShowQuery] = useState<boolean>(true)

  const d3Container = useRef(null)
  const graphApi = new GraphApi(AXIOS_CONFIG())

  const handleResize = (): void => {
    setWidth(document?.getElementById('query-builder')?.clientWidth ?? 100)
  }

  function relationMouseEvents(
    simulation: d3.Simulation<d3.SimulationNodeDatum, undefined>,
    relation: d3.Selection<
      d3.BaseType | SVGPathElement,
      D3Relation<QueryRelation>,
      SVGGElement,
      unknown
    >
  ): void {
    relation.on('click', (e: unknown, rel: D3Relation<QueryRelation>) => {
      if (rel.relation.depth === '1') {
        // eslint-disable-next-line no-param-reassign
        rel.relation.depth = 'n'
      } else {
        // eslint-disable-next-line no-param-reassign
        rel.relation.depth = '1'
      }
    })
  }

  useEffect(() => {
    graphApi.apiGraphGet().then((g): void => setGraph(g.data))
    window.addEventListener('resize', handleResize)
    return (): void => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  useLayoutEffect(() => {
    setWidth(document?.getElementById('query-builder')?.clientWidth ?? 100)
  }, [])

  function addPossibleNode(node: Node): D3Node<QueryNode> {
    const qNode: QueryNode = {
      id: v4(),
      varName: `${node.label}_${varCounter.get(node.label || '') ?? 1}`,
      node,
      selected: false,
    }
    const wrapNode = D3Helper.wrapNode(qNode)
    wrapNode.radius = 40
    return wrapNode
  }

  const getPossibleRelations = (nodeId: string): Relation[] => {
    return (graph?.relations || []).filter(
      (r) => r.sourceId === nodeId || r.targetId === nodeId
    )
  }

  const addPossibleRelations = (d: D3Node<QueryNode>): void => {
    const possibleNodes: D3Node<QueryNode>[] = []
    const possibleRelations: QueryRelation[] = getPossibleRelations(
      d.node.node.id || ''
    ).flatMap((r: Relation): QueryRelation[] => {
      const tmpRelations: QueryRelation[] = []
      const relationObj = {
        varName: `${r.type}_${varCounter.get(r.type) ?? 1}`,
        relation: r,
        selected: false,
      }
      if (r.targetId === d.node.node.id) {
        const [n] = (graph?.nodes || []).filter(
          (tempNode: Node): boolean => r.sourceId === tempNode.id
        )
        const sourceNode = addPossibleNode(n)
        possibleNodes.push(sourceNode)
        tmpRelations.push({
          ...relationObj,
          id: v4(),
          sourceId: sourceNode.node.id,
          targetId: d.node.id,
          depth: '1',
        })
      }
      if (r.sourceId === d.node.node.id) {
        const [n] = (graph?.nodes || []).filter(
          (tempNode: Node): boolean => r.targetId === tempNode.id
        )
        const targetNode = addPossibleNode(n)
        possibleNodes.push(targetNode)
        tmpRelations.push({
          ...relationObj,
          id: v4(),
          sourceId: d.node.id,
          targetId: targetNode.node.id,
          depth: '1',
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
    const activeRel = relations.filter(
      (r) =>
        activeNodes.some((n) => n.node.id === r.relation.targetId) &&
        activeNodes.some((n) => n.node.id === r.relation.sourceId)
    )
    setNodes([...activeNodes])
    setRelations([...activeRel])
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
        n.node.node.label || '',
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
      (): void =>
        tick<QueryNode, QueryRelation>(node, labels, relation, width, height),
      false
    )
    relationMouseEvents(simulation, relation)

    nodeMouseEvents(
      simulation,
      node,
      (event: unknown, d3Node: D3Node<QueryNode>): void => {
        if (d3Node.node.selected) {
          setSelectActive(true)
          addPossibleRelations(d3Node)
        } else {
          // eslint-disable-next-line no-param-reassign
          d3Node.node.selected = true
          // eslint-disable-next-line no-param-reassign
          d3Node.fx = d3Node.x
          // eslint-disable-next-line no-param-reassign
          d3Node.fy = d3Node.y
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
      }
    )
  }, [nodes, relations, selectActive])

  const addNode = (node: Node): void => {
    const qNode: QueryNode = {
      id: v4(),
      varName: `${node.label}_${1}`,
      node,
      selected: true,
    }
    const newNode = D3Helper.wrapNode(qNode)
    newNode.radius = 50
    newNode.x = 0
    newNode.y = 0
    newNode.fx = 0
    newNode.fy = 0
    setNodes([newNode])
    setRelations([])
    updateCounterMap(new Map(), [], [newNode])
    onChange({
      nodes: [qNode],
      relations: [],
    })
  }

  const deleteNode = (node: Node): void => {
    const filterNodes = nodes.filter((n) => n.node.id !== node.id)
    const filterRelations = relations.filter(
      (r) => node.id !== r.relation.targetId && node.id !== r.relation.sourceId
    )
    setNodes(filterNodes)
    setRelations(filterRelations)

    onChange({
      nodes: filterNodes.map((n) => n.node),
      relations: filterRelations.map((r) => r.relation),
    })
  }

  return (
    <Box id="query-builder" width="100%">
      <Box mt={3} mb={2} display="flex" alignItems="center">
        <Typography variant="button">Query Builder</Typography>
        <Switch
          checked={showQuery}
          onChange={(): void => setShowQuery(!showQuery)}
          name="showQuery"
          color="primary"
        />
      </Box>
      <Collapse in={showQuery}>
        {(graph?.nodes || []).map(
          (n): JSX.Element => (
            <CustomButton
              title={n.label || ''}
              key={n.id}
              onClick={(): void => addNode(n)}
              customColor={n.color}
              style={{
                marginRight: '1rem',
                marginBottom: '1rem',
                borderRadius: '5px',
              }}
            />
          )
        )}

        <Box my={3}>
          <Typography variant="button">Removable Nodes</Typography>
          <Box mt={1}>
            {nodes
              .filter((n) => n.node.selected)
              .filter((node) => {
                const findRelations = relations.filter(
                  (rel) =>
                    rel.relation.sourceId === node.node.id ||
                    rel.relation.targetId === node.node.id
                )
                return findRelations.length <= 1
              })
              .map((n) => (
                <Chip
                  key={n.node.id}
                  label={n.node.varName}
                  onDelete={(): void => deleteNode(n.node)}
                  color="primary"
                  variant="outlined"
                  style={{ marginRight: '0.5rem' }}
                />
              ))}
          </Box>
        </Box>
        <Box mt={2}>
          <svg
            onClick={(): void => {
              cleanNodes()
              setSelectActive(false)
            }}
            width={width}
            height={height}
            ref={d3Container}
            style={{
              borderRadius: '5px',
              border: `2px dashed lightGrey`,
            }}
          />
        </Box>
      </Collapse>
    </Box>
  )
}
