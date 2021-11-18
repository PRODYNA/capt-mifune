import {
  AccordionDetails,
  Box,
  createStyles,
  IconButton,
  ListItemIcon,
  ListItemText,
  makeStyles,
  TextField,
  Tooltip,
} from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add'
import React, { useState } from 'react'
import { useTheme } from '@material-ui/core/styles'
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord'
import graphService from '../../api/GraphService'
import { Domain, GraphDelta, Node } from '../../api/model/Model'
import { NodeSelect } from './NodeSelect'
import CustomButton from '../../components/Button/CustomButton'
import CustomAccordion from '../../components/Accordion/CustomAccordion'

interface DomainListEntryProps {
  domain: Domain
  onUpdate: (domain: Domain) => void
  onSelect: (domain: Domain) => void
  onDelete: (graphDelta: GraphDelta) => void
  addNode: (domain: Domain) => void
  active: boolean
  nodes: Node[]
}

export const DomainListEntry = (props: DomainListEntryProps): JSX.Element => {
  const { domain, active, nodes, onUpdate, onDelete, onSelect, addNode } = props
  const [collapse, setCollapse] = useState<boolean>(false)
  const [name, setName] = useState(domain.name)
  const [rootNodeId, setRootNodeId] = useState(domain.rootNodeId)
  const theme = useTheme()

  const useStyles = makeStyles(() =>
    createStyles({
      active: {
        backgroundColor: theme.palette.grey[100],
      },
      icon: {
        fontSize: 20,
      },
    })
  )

  const classes = useStyles()

  const executeUpdate = (): void => {
    graphService
      .domainPut(domain.id, {
        ...domain,
        name,
        rootNodeId,
      })
      .then((d) => onUpdate(d))
  }

  const buildBadge = (): JSX.Element => {
    return (
      <Tooltip
        arrow
        title={domain.modelValid ? 'mapping valid' : 'mapping invalid'}
      >
        <FiberManualRecordIcon
          className={classes.icon}
          htmlColor={
            domain.modelValid
              ? theme.palette.success.main
              : theme.palette.warning.main
          }
        />
      </Tooltip>
    )
  }

  const buildActive = (): JSX.Element => {
    if (!active) {
      return <></>
    }

    return (
      <Box maxWidth={199} p={0}>
        <TextField
          autoComplete="off"
          id="node-label"
          value={name}
          label="Name"
          fullWidth
          onChange={(e) => {
            e.stopPropagation()
            setName(e.target.value)
          }}
          onClick={(e) => e.stopPropagation()}
        />
        <NodeSelect
          nodes={nodes}
          nodeId={rootNodeId}
          updateNode={(n) => {
            console.log(n.label)
            setRootNodeId(n.id)
          }}
        />
      </Box>
    )
  }

  return (
    <CustomAccordion
      id={domain.id}
      title={domain.name}
      summary={
        <>
          <ListItemIcon>{buildBadge()}</ListItemIcon>
          <ListItemText primary={domain.name} />
          <IconButton
            title="create node"
            size="small"
            color="primary"
            onClick={(e) => {
              addNode(domain)
              e.stopPropagation()
            }}
          >
            <AddIcon />
          </IconButton>
        </>
      }
      actions={
        <>
          <CustomButton
            customColor={theme.palette.error.main}
            size="small"
            title="Delete"
            onClick={() => {
              graphService
                .domainDelete(domain.id)
                .then((delta) => onDelete(delta))
            }}
          />
          <CustomButton
            customColor={theme.palette.success.main}
            size="small"
            title="Save"
            onClick={(e) => {
              executeUpdate()
              e.stopPropagation()
            }}
          />
        </>
      }
      onClick={(): void => {
        setCollapse(!collapse)
        onSelect(domain)
      }}
    >
      <AccordionDetails>{buildActive()}</AccordionDetails>
    </CustomAccordion>
  )
}
