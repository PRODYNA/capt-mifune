import { useEffect, useState } from 'react'
import {
  Box,
  Chip,
  Container,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
} from '@mui/material'
import { EventSourcePolyfill } from 'ng-event-source'
import PipelineRow from './PipelineRow'
import CustomDialog from '../../components/Dialog/CustomDialog'
import { Domain, GraphStatistics } from '../../services'
import { CustomDeleteIcon } from '../../components/Icons/CustomIcons'
import { CustomTexts } from '../../utils/CustomTexts'
import { eventApi, graphApi } from '../../openapi/api'

interface Message {
  [key: string]: number
}

const Pipelines = (): JSX.Element => {
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
    graphApi.fetchDomains().then((d) => setDomains(d.data))
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

  return (
    <Container>
      <Box mt={3}>
        <Box mb={3} display="flex" justifyContent="space-between">
          <Typography variant="h5">Pipelines</Typography>
          <Box>
            <Chip
              sx={{
                marginRight: '1rem',
              }}
              label={`nodes: ${statistics?.nodes}`}
              color="primary"
            />
            <Chip
              sx={{
                marginRight: '1rem',
              }}
              label={`relations: ${statistics?.relations}`}
              color="primary"
            />
          </Box>
          <Button
            color="error"
            variant="contained"
            onClick={(): void => setShowModal(true)}
            startIcon={<CustomDeleteIcon />}
          >
            {CustomTexts.resetDb}
          </Button>
        </Box>
        {showProgress && <LinearProgress color="primary" />}
        <TableContainer
          component={Paper}
          sx={{
            backgroundColor: 'inherit',
            border: '1px dashed grey',
            borderRadius: 0,
            '& .MuiTableCell-root': {
              borderBottom: 'unset',
            },
          }}
        >
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
        title={CustomTexts.resetDb}
        submitBtnText="Yes, Reset"
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
