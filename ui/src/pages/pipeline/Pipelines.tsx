import React, { useEffect, useState } from 'react'
import {
  Box,
  Chip,
  Container,
  LinearProgress,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/Delete'
import { useTheme } from '@material-ui/core/styles'
import { EventSourcePolyfill } from 'ng-event-source'
import PipelineRow from './PipelineRow'
import CustomButton from '../../components/Button/CustomButton'
import CustomDialog from '../../components/Dialog/CustomDialog'
import { Domain, GraphStatistics } from '../../services/models'
import { DomainApi } from '../../services/api'
import AXIOS_CONFIG from '../../openapi/axios-config'
import { EventApiImpl } from '../../helpers/event-api'

interface Message {
  [key: string]: number
}

const Pipelines = (): JSX.Element => {
  const eventApi = new EventApiImpl(AXIOS_CONFIG())
  const domainApi = new DomainApi(AXIOS_CONFIG())
  const [domains, setDomains] = useState<Domain[]>()
  const [showModal, setShowModal] = useState<boolean>(false)
  const [cleanActive, setCleanActive] = useState<boolean>(false)
  const [showProgress, setShowProgress] = useState<boolean>(false)
  const [statistics, setStatistics] = useState<GraphStatistics>()
  const [messages, setMessages] = useState<Message>({})
  const [tmpMessages, setTmpMessages] = useState<Message>({})
  const tableHeaders = [
    'Show Details',
    'Domain Name',
    'Model Valid',
    'Mapping Valid',
    'Run Import',
    'Stop Import',
    'Clear Domain',
    'Root Nodes',
    'ID',
  ]

  const classes = makeStyles({
    chip: {
      marginRight: '1rem',
    },
    paper: {
      backgroundColor: 'inherit',
      border: '1px dashed grey',
      borderRadius: 0,
      '& .MuiTableCell-root': {
        borderBottom: 'unset',
      },
    },
  })()
  let importStatsClient: EventSourcePolyfill

  useEffect(() => {
    importStatsClient = eventApi.importSource()
    importStatsClient.onmessage = (e) => {
      const newStats = JSON.parse(e.data)
      setTmpMessages(newStats)
    }
    return function cleanUp() {
      importStatsClient.close()
    }
  }, [cleanActive])

  useEffect(() => {
    setMessages({ ...messages, ...tmpMessages })
  }, [tmpMessages])

  useEffect(() => {
    domainApi.apiGraphDomainsGet().then((d) => setDomains(d.data))
  }, [])

  useEffect(() => {
    const sseClient = eventApi.graphStats()
    sseClient.onmessage = (e) => {
      setStatistics(JSON.parse(e.data))
    }
    return function cleanUp() {
      sseClient.close()
    }
  }, [cleanActive])

  const clean = (): void => {
    const sseClient = eventApi.cleanDatabase()
    sseClient.onmessage = () => {
      setCleanActive(true)
    }
    sseClient.onerror = () => {
      setCleanActive(false)
      sseClient.close()
    }
  }

  const theme = useTheme()

  return (
    <Container>
      <Box mt={3}>
        <Box mb={3} display="flex" justifyContent="space-between">
          <Typography variant="h5">Pipelines</Typography>
          <Box>
            <Chip
              className={classes.chip}
              label={`nodes: ${statistics?.nodes}`}
              color="primary"
            />
            <Chip
              className={classes.chip}
              label={`relations: ${statistics?.relations}`}
              color="primary"
            />
          </Box>
          <CustomButton
            title="Reset Database"
            type="submit"
            customColor={theme.palette.error.main}
            onClick={(): void => setShowModal(true)}
            startIcon={<DeleteIcon />}
          />
        </Box>
        {showProgress && <LinearProgress color="primary" />}
        <TableContainer component={Paper} className={classes.paper}>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow key="table-header">
                {tableHeaders.map(
                  (tableHeader: string): JSX.Element => (
                    <TableCell key={tableHeader}>
                      <Typography variant="body2">{tableHeader}</Typography>
                    </TableCell>
                  )
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {domains?.map((row) => (
                <PipelineRow
                  message={messages[row.id as string] ?? ''}
                  key={row.id}
                  domain={row}
                  cleanActive={cleanActive}
                  setShowProgress={setShowProgress}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <CustomDialog
        open={showModal}
        setOpen={setShowModal}
        title="Reset Database"
        submitBtnText="Yes, Reset"
        submitBtnColor={theme.palette.error.main}
        handleSubmit={clean}
      >
        <Typography variant="body1">
          Sure, you want to reset the database?
        </Typography>
      </CustomDialog>
    </Container>
  )
}

export default Pipelines
