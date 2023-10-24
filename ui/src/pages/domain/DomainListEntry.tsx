import {
  Box,
  Button,
  ButtonGroup,
  FormControl,
  ListItemIcon,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { SyntheticEvent, useContext, useState } from 'react'
import { useTheme } from '@mui/material/styles'
import { NodeSelect } from './NodeSelect'
import CustomAccordion from '../../components/Accordion/CustomAccordion'
import { SnackbarContext } from '../../context/Snackbar'
import { Translations } from '../../utils/Translations'
import CustomDialog from '../../components/Dialog/CustomDialog'
import { GraphContext } from '../../context/GraphContext'
import { D3Helper } from '../../helpers/D3Helper'
import { Domain, GraphDelta } from '../../services'
import {
  CustomAddIcon,
  CustomDeleteIcon,
  CustomRecordIcon,
  CustomSaveIcon,
  CustomVisibilityIcon,
  CustomVisibilityOffIcon,
} from '../../components/Icons/CustomIcons'
import { graphApi } from '../../openapi/api'

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
      graphApi
        .updateDomain(domain.id, {
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
      graphApi
        .deleteDomain(domain.id)
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
        <CustomRecordIcon
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
            <ListItemIcon sx={{ minWidth: '2rem' }}>
              {buildBadge()}
            </ListItemIcon>
            <ListItemIcon
              sx={{ minWidth: '2rem' }}
              onClick={(e): void => {
                e.stopPropagation()
                setIsVisible(!isVisible)
                hideSelectedDomain()
              }}
            >
              {isVisible ? (
                <CustomVisibilityIcon />
              ) : (
                <CustomVisibilityOffIcon />
              )}
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
          <ButtonGroup variant="outlined" color="primary" disableElevation>
            <Tooltip arrow title="Delete Domain">
              <Button onClick={() => setShowModal(true)}>
                <CustomDeleteIcon htmlColor={theme.palette.error.main} />
              </Button>
            </Tooltip>
            <Tooltip arrow title="Add new Node to Domain">
              <Button onClick={addDomainNode}>
                <CustomAddIcon htmlColor={theme.palette.secondary.main} />
              </Button>
            </Tooltip>
            <Tooltip arrow title="Save changes">
              <Button onClick={updateDomain}>
                <CustomSaveIcon htmlColor={theme.palette.success.main} />
              </Button>
            </Tooltip>
          </ButtonGroup>
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
        handleSubmit={deleteDomain}
      >
        <Typography variant="body1">
          Sure, you want to delete the Domain: {domain.name} ?
        </Typography>
      </CustomDialog>
    </>
  )
}
