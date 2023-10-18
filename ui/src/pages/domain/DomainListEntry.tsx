import {
  Box,
  FormControl,
  IconButton,
  ListItemIcon,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import React, { SyntheticEvent, useContext, useState } from 'react'
import { useTheme } from '@mui/material/styles'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import Delete from '@mui/icons-material/Delete'
import Save from '@mui/icons-material/Save'
import Add from '@mui/icons-material/Add'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { NodeSelect } from './NodeSelect'
import CustomAccordion from '../../components/Accordion/CustomAccordion'
import { SnackbarContext } from '../../context/Snackbar'
import { Translations } from '../../utils/Translations'
import CustomDialog from '../../components/Dialog/CustomDialog'
import GraphContext from '../../context/GraphContext'
import { D3Helper } from '../../helpers/D3Helper'
import { Domain, GraphDelta } from '../../services/models'
import { DomainApi } from '../../services/api/domain-api'
import AXIOS_CONFIG from '../../openapi/axios-config'

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
  const [isVisible, setIsVisible] = useState<boolean>(true)
  const { openSnackbar, openSnackbarError } = useContext(SnackbarContext)
  const [showModal, setShowModal] = useState<boolean>(false)
  const {
    nodes,
    domains,
    selectedDomain,
    setDomains,
    hideDomains,
    setHideDomains,
    setSelected,
    setSelectedDomain,
  } = useContext(GraphContext)
  const theme = useTheme()
  const domainApi = new DomainApi(AXIOS_CONFIG())

  const handleChange = (): void => {
    if (domain.id) toggleAccordion(domain.id)
    if (selectedDomain?.id === domain.id) {
      setSelectedDomain(undefined)
    } else {
      setSelectedDomain(domain)
    }
  }

  const hideSelectedDomain = (): void => {
    const findDomain = hideDomains.find((item) => item === domain.id)
    if (!findDomain) setHideDomains([...hideDomains, domain.id as string])
    else {
      const filterDomains = hideDomains.filter((d) => d !== domain.id)
      setHideDomains(filterDomains)
    }
  }

  const addDomainNode = (): void => {
    setSelected(
      D3Helper.wrapNode({
        id: '',
        domainIds: [domain.id ?? ''],
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
        label: '',
        properties: [],
      })
    )
    setSelectedDomain(domain)
  }

  const updateDomain = (): void => {
    if (domain.id)
      domainApi
        .apiGraphDomainIdPut(domain.id, {
          ...domain,
          name,
          rootNodeId,
        })
        .then((res) => {
          setDomains(
            domains.filter((d) => d.id !== res.data.id).concat(res.data)
          )
          setSelectedDomain(res.data)
          openSnackbar(Translations.SAVE, 'success')
        })
        .catch((e) => openSnackbarError(e))
  }

  const deleteDomain = (): void => {
    if (domain.id)
      domainApi
        .apiGraphDomainIdDelete(domain.id)
        .then((delta) => {
          updateState(delta.data)
          setSelected(undefined)
          openSnackbar(Translations.DELETE, 'success')
        })
        .catch((e) => openSnackbarError(e))
  }

  const buildBadge = (): JSX.Element => {
    return (
      <Tooltip arrow title={domain.modelValid ? 'valid' : 'invalid'}>
        <FiberManualRecordIcon
          sx={{
            fontSize: 20,
          }}
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
      return <Box />
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
        id={domain.id ?? ''}
        title={domain.name}
        isExpanded={expanded}
        summary={
          <>
            <ListItemIcon style={{ minWidth: '2rem' }}>
              {buildBadge()}
            </ListItemIcon>
            <ListItemIcon
              style={{ minWidth: '2rem' }}
              onClick={(e): void => {
                e.stopPropagation()
                setIsVisible(!isVisible)
                hideSelectedDomain()
              }}
            >
              {isVisible ? <Visibility /> : <VisibilityOff />}
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
        onChange={(event: SyntheticEvent<Element, Event>): void => {
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
