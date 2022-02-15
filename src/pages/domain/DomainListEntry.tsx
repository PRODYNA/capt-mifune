import {
  Box,
  createStyles,
  FormControl,
  IconButton,
  ListItemIcon,
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
import { Domain, GraphDelta } from '../../api/model/Model'
import { NodeSelect } from './NodeSelect'
import CustomAccordion from '../../components/Accordion/CustomAccordion'
import { SnackbarContext } from '../../context/Snackbar'
import { Translations } from '../../utils/Translations'
import CustomDialog from '../../components/Dialog/CustomDialog'
import GraphContext from '../../context/GraphContext'
import { D3Helper } from '../../helpers/D3Helper'

interface DomainListEntryProps {
  domain: Domain
  expanded: string
  toggleAccordion: (item: string) => void
  updateState: (g: GraphDelta) => void
}

export const DomainListEntry = (props: DomainListEntryProps): JSX.Element => {
  const { domain, expanded, toggleAccordion, updateState } = props
  const [name, setName] = useState(domain.name)
  const [rootNodeId, setRootNodeId] = useState(domain.rootNodeId)
  const { openSnackbar, openSnackbarError } = useContext(SnackbarContext)
  const [showModal, setShowModal] = useState<boolean>(false)
  const {
    nodes,
    domains,
    selectedDomain,
    setDomains,
    setSelected,
    setSelectedDomain,
  } = useContext(GraphContext)
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

  const handleChange = (): void => {
    toggleAccordion(domain.id)
    if (selectedDomain?.id === domain.id) {
      setSelectedDomain(undefined)
    } else {
      setSelectedDomain(domain)
    }
  }

  const addDomainNode = (): void => {
    setSelected(
      D3Helper.wrapNode({
        id: '',
        domainIds: [domain.id],
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
        label: '',
        properties: [],
      })
    )
    setSelectedDomain(domain)
  }

  const updateDomain = (): void => {
    graphService
      .domainPut(domain.id, {
        ...domain,
        name,
        rootNodeId,
      })
      .then((res: Domain) => {
        setDomains(domains.filter((d) => d.id !== res.id).concat(res))
        setSelectedDomain(res)
        openSnackbar(Translations.SAVE, 'success')
      })
      .catch((e) => openSnackbarError(e))
  }

  const deleteDomain = (): void => {
    graphService
      .domainDelete(domain.id)
      .then((delta) => {
        updateState(delta)
        setSelected(undefined)
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
    if (domain.id !== selectedDomain?.id) {
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
            nodes={nodes.map((n) => n.node)}
            nodeId={rootNodeId}
            label="Domain node"
            updateNode={(n) => {
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
            <ListItemIcon style={{ minWidth: '2rem' }}>
              {buildBadge()}
            </ListItemIcon>
            <span
              style={{
                whiteSpace: 'nowrap',
                width: '140px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontSize: 16,
              }}
            >
              {domain.name}
            </span>
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
              <IconButton onClick={addDomainNode}>
                <Add htmlColor={theme.palette.secondary.main} />
              </IconButton>
            </Tooltip>
            <Tooltip arrow title="Save changes">
              <IconButton onClick={updateDomain}>
                <Save htmlColor={theme.palette.success.main} />
              </IconButton>
            </Tooltip>
          </>
        }
        onChange={(event: React.ChangeEvent<Record<string, unknown>>): void => {
          event.preventDefault()
          handleChange()
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
        handleSubmit={deleteDomain}
      >
        <Typography variant="body1">
          Sure, you want to delete the Domain: {domain.name} ?
        </Typography>
      </CustomDialog>
    </>
  )
}
