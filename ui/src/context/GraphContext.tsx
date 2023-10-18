/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { createContext, useState } from 'react'
import { D3Node, D3Relation } from '../helpers/D3Helper'
import { Domain, Relation, Node } from '../services/models'

type GraphContextType = {
  selectedDomain: Domain | undefined
  setSelectedDomain: (v: Domain | undefined) => void
  domains: Domain[]
  hideDomains: string[]
  setDomains: (v: Domain[]) => void
  setHideDomains: (v: string[]) => void
  selected: D3Node<Node> | D3Relation<Relation> | undefined
  setSelected: (v: D3Node<Node> | D3Relation<Relation> | undefined) => void
  nodes: D3Node<Node>[]
  setNodes: (v: D3Node<Node>[]) => void
  relations: D3Relation<Relation>[]
  setRelations: (v: D3Relation<Relation>[]) => void
}

const GraphContext = createContext<GraphContextType>({
  selectedDomain: undefined,
  setSelectedDomain: (v: Domain | undefined) => {},
  domains: [],
  hideDomains: [],
  setDomains: (v: Domain[]) => {},
  setHideDomains: (v: string[]) => {},
  selected: undefined,
  setSelected: (v: D3Node<Node> | D3Relation<Relation> | undefined) => {},
  nodes: [],
  setNodes: (v: D3Node<Node>[]) => {},
  relations: [],
  setRelations: (v: D3Relation<Relation>[]) => {},
})

export default GraphContext
