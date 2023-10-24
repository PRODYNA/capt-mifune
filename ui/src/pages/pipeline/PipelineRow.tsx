import { Dispatch, SetStateAction, useContext } from 'react'

import { IconButton, TableCell, TableRow } from '@mui/material'
import { useNavigate } from 'react-router-dom'

import { useTheme } from '@mui/material/styles'
import { SnackbarContext } from '../../context/Snackbar'
import { Translations } from '../../utils/Translations'
import { DataApi, Domain } from '../../services'
import AXIOS_CONFIG from '../../openapi/axios-config'
import {
  CustomCheckIcon,
  CustomClearIcon,
  CustomVisibilityIcon,
  CustomWarningIcon,
  CustomPlayIcon,
  CustomStopIcon,
} from '../../components/Icons/CustomIcons'

interface IPipelineRow {
  domain: Domain
  cleanActive: boolean
  message: number
  setShowProgress: Dispatch<SetStateAction<boolean>>
}

const PipelineRow = (props: IPipelineRow): JSX.Element => {
  const { domain, cleanActive, message, setShowProgress } = props
  const navigate = useNavigate()
  const { openSnackbar, openSnackbarError } = useContext(SnackbarContext)
  const theme = useTheme()
  const dataApi = new DataApi(AXIOS_CONFIG())

  const valid = (isValid: boolean | undefined): JSX.Element => {
    if (isValid)
      return <CustomCheckIcon htmlColor={theme.palette.success.main} />
    return <CustomWarningIcon htmlColor={theme.palette.warning.main} />
  }

  const runImport = (): void => {
    setShowProgress(true)
    if (domain.id)
      dataApi
        .importDomain(domain.id)
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
    if (domain.id)
      dataApi
        .cancelImport(domain.id)
        .then(() => openSnackbar(Translations.IMPORT_STOPPED, 'success'))
        .catch((e) => openSnackbarError(e))
  }

  const clearDomain = (): void => {
    if (domain.id)
      dataApi
        .clearDomain(domain.id)
        .then(() => openSnackbar(Translations.DOMAIN_CLEAR, 'success'))
        .catch((e) => openSnackbarError(e))
  }

  return (
    <TableRow key={domain.id}>
      <TableCell
        align="left"
        onClick={() => navigate(`/ui/pipeline/${domain.id}`)}
      >
        <IconButton size="small">
          <CustomVisibilityIcon htmlColor={theme.palette.grey[700]} />
        </IconButton>
      </TableCell>
      <TableCell align="left">{domain.name}</TableCell>
      <TableCell align="center">{valid(domain.modelValid)}</TableCell>
      <TableCell align="center">{valid(domain.mappingValid)}</TableCell>
      <TableCell align="center">
        <IconButton size="small" disabled={cleanActive} onClick={runImport}>
          <CustomPlayIcon htmlColor={theme.palette.primary.main} />
        </IconButton>
      </TableCell>
      <TableCell align="center">
        <IconButton size="small" onClick={stopImport}>
          <CustomStopIcon htmlColor={theme.palette.info.main} />
        </IconButton>
      </TableCell>
      <TableCell align="center">
        <IconButton size="small" onClick={clearDomain}>
          <CustomClearIcon htmlColor={theme.palette.error.main} />
        </IconButton>
      </TableCell>
      <TableCell align="left">{message}</TableCell>
      <TableCell align="left">{domain.id}</TableCell>
    </TableRow>
  )
}

export default PipelineRow
