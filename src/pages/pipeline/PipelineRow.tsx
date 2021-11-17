import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import WarningIcon from '@material-ui/icons/Warning'
import ClearIcon from '@material-ui/icons/Clear'
import DoneIcon from '@material-ui/icons/Done'
import { IconButton, TableCell, TableRow } from '@material-ui/core'
import { useHistory } from 'react-router-dom'
import StopIcon from '@material-ui/icons/Stop'
import VisibilityIcon from '@material-ui/icons/Visibility'
import { useTheme } from '@material-ui/core/styles'
import graphService from '../../api/GraphService'
import { Domain } from '../../api/model/Model'
import { SnackbarContext } from '../../context/Snackbar'
import { Translations } from '../../utils/Translations'

interface IPipelineRow {
  domain: Domain
  cleanActive: boolean
  setShowProgress: Dispatch<SetStateAction<boolean>>
}

const PipelineRow = (props: IPipelineRow) => {
  const { domain, cleanActive, setShowProgress } = props
  const history = useHistory()
  const [message, setMessage] = useState<string>()
  const { openSnackbar, openSnackbarError } = useContext(SnackbarContext)
  const theme = useTheme()

  useEffect(() => {
    const sseClient = graphService.importSource(domain.id)
    sseClient.onmessage = function (e) {
      setMessage(e.data)
    }

    return function cleanUp() {
      sseClient.close()
    }
  }, [domain.id, cleanActive])

  const valid = (valid: boolean): JSX.Element => {
    if (valid) return <DoneIcon htmlColor={theme.palette.success.main} />
    return <WarningIcon htmlColor={theme.palette.warning.main} />
  }

  const runImport = (): void => {
    setShowProgress(true)
    graphService
      .domainRunImport(domain.id)
      .then(() => {
        openSnackbar(Translations.IMPORT_RUN, 'success')
        setShowProgress(false)
      })
      .catch((e) => {
        openSnackbarError(e)
        setShowProgress(false)
      })
  }

  const stopImport = (): void => {
    graphService
      .domainStopImport(domain.id)
      .then(() => openSnackbar(Translations.IMPORT_STOPPED, 'success'))
      .catch((e) => openSnackbarError(e))
  }

  const clearDomain = (): void => {
    graphService
      .domainClear(domain.id)
      .then(() => openSnackbar(Translations.DOMAIN_CLEAR, 'success'))
      .catch((e) => openSnackbarError(e))
  }

  return (
    <>
      <TableRow key={domain.id}>
        <TableCell
          align="left"
          onClick={() => history.push(`/pipeline/${domain.id}`)}
        >
          <IconButton size="small">
            <VisibilityIcon htmlColor={theme.palette.grey[700]} />
          </IconButton>
        </TableCell>
        <TableCell align="left">{domain.name}</TableCell>
        <TableCell align="center">{valid(domain.modelValid)}</TableCell>
        <TableCell align="center">{valid(domain.mappingValid)}</TableCell>
        <TableCell align="center">
          <IconButton size="small" disabled={cleanActive} onClick={runImport}>
            <PlayArrowIcon htmlColor={theme.palette.primary.main} />
          </IconButton>
        </TableCell>
        <TableCell align="center">
          <IconButton size="small" onClick={stopImport}>
            <StopIcon htmlColor={theme.palette.info.main} />
          </IconButton>
        </TableCell>
        <TableCell align="center">
          <IconButton size="small" onClick={clearDomain}>
            <ClearIcon htmlColor={theme.palette.error.main} />
          </IconButton>
        </TableCell>
        <TableCell align="left">{message}</TableCell>
        <TableCell align="left">{domain.id}</TableCell>
      </TableRow>
    </>
  )
}

export default PipelineRow
