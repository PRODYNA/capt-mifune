import {
  Box,
  createStyles,
  FormControl,
  IconButton,
  ListItemIcon,
  ListItemText,
  makeStyles,
  TextField,
  Tooltip,
  Typography,
} from '@material-ui/core'
import React, { useContext, useState } from 'react'
import { useTheme } from '@material-ui/core/styles'
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord'
import Delete from '@material-ui/icons/Delete'
import Save from '@material-ui/icons/Save'
import Add from '@material-ui/icons/Add'
import graphService from '../../api/GraphService'
import { Domain, GraphDelta, Node } from '../../api/model/Model'
import { NodeSelect } from './NodeSelect'
import CustomAccordion from '../../components/Accordion/CustomAccordion'
import { SnackbarContext } from '../../context/Snackbar'
import { Translations } from '../../utils/Translations'
import CustomDialog from '../../components/Dialog/CustomDialog'

interface DomainListEntryProps {
  domain: Domain
  expanded: string
  toggleAccordion: (item: string) => void
  onUpdate: (domain: Domain) => void
  onSelect: (domain: Domain) => void
  onDelete: (graphDelta: GraphDelta) => void
  addNode: (domain: Domain) => void
  active: boolean
  nodes: Node[]
}

export const DomainListEntry = (props: DomainListEntryProps): JSX.Element => {
  const {
    domain,
    active,
    nodes,
    expanded,
    toggleAccordion,
    onUpdate,
    onDelete,
    onSelect,
    addNode,
  } = props
  const [name, setName] = useState(domain.name)
  const [rootNodeId, setRootNodeId] = useState(domain.rootNodeId)
  const { openSnackbar, openSnackbarError } = useContext(SnackbarContext)
  const [showModal, setShowModal] = useState<boolean>(false)
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

  const handleUpdate = (): void => {
    graphService
      .domainPut(domain.id, {
        ...domain,
        name,
        rootNodeId,
      })
      .then((d) => {
        onUpdate(d)
        openSnackbar(Translations.SAVE, 'success')
      })
      .catch((e) => openSnackbarError(e))
  }

  const handleDelete = (): void => {
    graphService
      .domainDelete(domain.id)
      .then((delta) => {
        onDelete(delta)
        openSnackbar(Translations.DELETE, 'success')
      })
      .catch((e) => openSnackbarError(e))
  }

  const buildBadge = (): JSX.Element => {
    return (
      <Tooltip arrow title={domain.modelValid ? 'valid' : 'invalid'}>
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

  const renderForm = (): JSX.Element => {
    if (!active) {
      return <></>
    }

    return (
      <Box maxWidth={199} p={0}>
        <FormControl>
          <TextField
            autoComplete="off"
            id="node-label"
            value={name}
            label="Domain name"
            fullWidth
            onChange={(e) => setName(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
        </FormControl>
        <FormControl fullWidth>
          <NodeSelect
            nodes={nodes}
            nodeId={rootNodeId}
            label="Domain node"
            updateNode={(n) => {
              console.log(n.label)
              setRootNodeId(n.id)
            }}
          />
        </FormControl>
      </Box>
    )
  }

  return (
    <>
      <CustomAccordion
        id={domain.id}
        title={domain.name}
        isExpanded={expanded}
        summary={
          <>
            <ListItemIcon>{buildBadge()}</ListItemIcon>
            <ListItemText primary={domain.name} />
          </>
        }
        actions={
          <>
            <Tooltip arrow title="Delete Domain">
              <IconButton onClick={() => setShowModal(true)}>
                <Delete htmlColor={theme.palette.error.main} />
              </IconButton>
            </Tooltip>
            <Tooltip arrow title="Add new Node to Domain">
              <IconButton onClick={() => addNode(domain)}>
                <Add htmlColor={theme.palette.secondary.main} />
              </IconButton>
            </Tooltip>
            <Tooltip arrow title="Save changes">
              <IconButton onClick={() => handleUpdate()}>
                <Save htmlColor={theme.palette.success.main} />
              </IconButton>
            </Tooltip>
          </>
        }
        onChange={(event: React.ChangeEvent<Record<string, unknown>>): void => {
          event.preventDefault()
          toggleAccordion(domain.id)
          onSelect(domain)
        }}
      >
        {renderForm()}
      </CustomAccordion>
      <CustomDialog
        open={showModal}
        setOpen={setShowModal}
        title="Delete Domain"
        submitBtnText="Yes, Delete"
        submitBtnColor={theme.palette.error.main}
        handleSubmit={handleDelete}
      >
        <Typography variant="body1">
          Sure, you want to delete the Domain: {domain.name} ?
        </Typography>
      </CustomDialog>
    </>
  )
}
