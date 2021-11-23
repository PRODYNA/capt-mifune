import React, { Dispatch, SetStateAction, useState } from 'react'
import { Box, createStyles, makeStyles, Typography } from '@material-ui/core'
import { Domain, GraphDelta, Node, Relation } from '../../api/model/Model'
import { DomainListEntry } from './DomainListEntry'
import { D3Helper, D3Node, D3Relation } from '../graph/D3Helper'

interface DomainListProps {
  domains: Domain[]
  nodes: Node[]
  selectedDomain?: Domain
  setDomains: Dispatch<SetStateAction<Domain[]>>
  setSelectedDomain: Dispatch<SetStateAction<Domain | undefined>>
  updateState: (g: GraphDelta) => void
  setSelected: Dispatch<
    SetStateAction<D3Node<Node> | D3Relation<Relation> | undefined>
  >
}

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      position: 'absolute',
      top: 25,
      right: 20,
      zIndex: 100,
      width: 220,
    },
  })
)

export const DomainList = (props: DomainListProps): JSX.Element => {
  const {
    nodes,
    domains,
    selectedDomain,
    setDomains,
    setSelected,
    setSelectedDomain,
    updateState,
  } = props
  const classes = useStyles()
  const [expanded, setExpanded] = useState<string>('')

  const toggleAccordion = (id: string): void => {
    setExpanded(id === expanded ? '' : id)
  }

  const onSubmit = (domain: Domain): void => {
    setDomains(domains.filter((d) => d.id !== domain.id).concat(domain))
    setSelectedDomain(domain)
  }
  const onSelect = (domain: Domain): void => {
    if (selectedDomain?.id === domain.id) {
      setSelectedDomain(undefined)
    } else {
      setSelectedDomain(domain)
    }
  }
  const onDelete = (graphDelta: GraphDelta): void => {
    updateState(graphDelta)
    setSelected(undefined)
  }
  const addNode = (domain: Domain): void => {
    setSelected(
      D3Helper.wrapNode({
        id: '',
        domainIds: [domain.id],
        color: 'blue',
        label: '',
        properties: [],
      })
    )
    setSelectedDomain(domain)
  }

  return (
    <Box className={classes.root}>
      <Box mb={2}>
        <Typography variant="subtitle2" color="textSecondary">
          Domain List
        </Typography>
      </Box>
      {domains
        .sort((d1, d2) => (d1.name > d2.name ? 1 : -1))
        .map((d) => (
          <DomainListEntry
            nodes={nodes}
            key={d.id}
            domain={d}
            onSelect={onSelect}
            onUpdate={onSubmit}
            onDelete={onDelete}
            addNode={addNode}
            expanded={expanded}
            toggleAccordion={toggleAccordion}
            active={d.id === selectedDomain?.id}
          />
        ))}
    </Box>
  )
}
