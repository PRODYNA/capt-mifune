import { createContext, useState } from 'react'
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

export const GraphContext = createContext<GraphContextType>(
  {} as GraphContextType
)

interface GraphProviderProps {
  children: JSX.Element | JSX.Element[]
}

const GraphProvider = (props: GraphProviderProps): JSX.Element => {
  const { children } = props

  const [selectedDomain, setSelectedDomain] = useState<Domain>()
  const [domains, setDomains] = useState<Domain[]>([])
  const [hideDomains, setHideDomains] = useState<string[]>([])
  const [nodes, setNodes] = useState<D3Node<Node>[]>([])
  const [relations, setRelations] = useState<D3Relation<Relation>[]>([])
  const [selected, setSelected] = useState<
    D3Node<Node> | D3Relation<Relation>
  >()

  return (
    <GraphContext.Provider
      value={{
        selectedDomain,
        setSelectedDomain,
        hideDomains,
        domains,
        setDomains,
        setHideDomains,
        selected,
        setSelected: (v): void => setSelected(v),
        nodes,
        setNodes: (v): void => setNodes(v),
        relations,
        setRelations,
      }}
    >
      {children}
    </GraphContext.Provider>
  )
}

export default GraphProvider
