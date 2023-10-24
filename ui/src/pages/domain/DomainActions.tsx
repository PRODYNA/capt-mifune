import { useContext } from 'react'
import { Box, Fab, Tooltip } from '@mui/material'
import { SnackbarContext } from '../../context/Snackbar'
import { Translations } from '../../utils/Translations'
import AXIOS_CONFIG from '../../openapi/axios-config'
import { GraphApi } from '../../services'
import { GraphContext } from '../../context/GraphContext'
import { CustomTexts } from '../../utils/CustomTexts'
import {
  CustomAddIcon,
  CustomDownloadIcon,
  CustomSaveIcon,
} from '../../components/Icons/CustomIcons'

interface IDomainActions {
  downloadSVG: () => void
}

const DomainActions = (props: IDomainActions): JSX.Element => {
  const { downloadSVG } = props
  const { domains, setDomains, setSelectedDomain } = useContext(GraphContext)
  const { openSnackbar, openSnackbarError } = useContext(SnackbarContext)
  const graphApi = new GraphApi(AXIOS_CONFIG())

  return (
    <Box
      position="absolute"
      bottom="1rem"
      left="50%"
      sx={{
        transform: 'translateX(-50%)',
      }}
    >
      <Tooltip title={CustomTexts.createDomain}>
        <Fab
          size="large"
          color="primary"
          sx={{
            animation:
              domains.length === 0 ? '$pulse-purple 2s infinite' : 'unset',
            '@keyframes pulse-purple': {
              '0%': {
                transform: 'scale(0.95)',
                boxShadow: '0 0 0 0 rgba(142, 68, 173, 0.7)',
              },
              '70%': {
                transform: 'scale(1)',
                boxShadow: '0 0 0 10px rgba(142, 68, 173, 0)',
              },
              '100% ': {
                transform: 'scale(0.95)',
                boxShadow: '0 0 0 0 rgba(142, 68, 173, 0)',
              },
            },
          }}
          onClick={() =>
            graphApi
              .createDomain({ name: `domain_${domains.length}` })
              .then((res) => {
                setDomains(domains.concat(res.data))
                setSelectedDomain(res.data)
              })
          }
        >
          <CustomAddIcon />
        </Fab>
      </Tooltip>
      <Tooltip title={CustomTexts.saveGraph}>
        <Fab
          size="large"
          color="success"
          sx={{
            mx: '1rem',
          }}
          onClick={() =>
            graphApi
              .persistGraph()
              .then(() => openSnackbar(Translations.SAVE, 'success'))
              .catch((e) => openSnackbarError(e))
          }
        >
          <CustomSaveIcon />
        </Fab>
      </Tooltip>
      <Tooltip title={CustomTexts.downloadGraph}>
        <Fab size="large" color="info" onClick={downloadSVG}>
          <CustomDownloadIcon />
        </Fab>
      </Tooltip>
    </Box>
  )
}

export default DomainActions
