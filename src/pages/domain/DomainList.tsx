import React, { useState } from 'react'
import { Box, createStyles, makeStyles, Typography } from '@material-ui/core'
import { Domain, GraphDelta } from '../../api/model/Model'
import { DomainListEntry } from './DomainListEntry'

interface DomainListProps {
  domains: Domain[]
  updateState: (g: GraphDelta) => void
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
  const { domains, updateState } = props
  const classes = useStyles()
  const [expanded, setExpanded] = useState<string>('')

  const toggleAccordion = (id: string): void => {
    setExpanded(id === expanded ? '' : id)
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
            key={d.id}
            domain={d}
            updateState={updateState}
            expanded={expanded}
            toggleAccordion={toggleAccordion}
          />
        ))}
    </Box>
  )
}
