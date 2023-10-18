import { useContext } from 'react'
import { Tooltip, Fab, Box } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import SaveIcon from '@mui/icons-material/Save'
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto'
import { SnackbarContext } from '../../context/Snackbar'
import { Translations } from '../../utils/Translations'
import AXIOS_CONFIG from '../../openapi/axios-config'
import { GraphApi, DomainApi } from '../../services'
import { GraphContext } from '../../context/GraphContext'

interface IDomainActions {
  downloadSVG: () => void
}

const DomainActions = (props: IDomainActions): JSX.Element => {
  const { downloadSVG } = props
  const { domains, setDomains, setSelectedDomain } = useContext(GraphContext)
  const { openSnackbar, openSnackbarError } = useContext(SnackbarContext)
  const domainApi = new DomainApi(AXIOS_CONFIG())
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
      <Tooltip title="Create new Domain">
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
            domainApi
              .apiGraphDomainPost({ name: `domain_${domains.length}` })
              .then((res) => {
                setDomains(domains.concat(res.data))
                setSelectedDomain(res.data)
              })
          }
        >
          <AddIcon />
        </Fab>
      </Tooltip>
      <Tooltip title="Save Graph">
        <Fab
          size="large"
          color="success"
          sx={{
            ml: '1rem',
          }}
          onClick={() =>
            graphApi
              .apiGraphPost()
              .then(() => openSnackbar(Translations.SAVE, 'success'))
              .catch((e) => openSnackbarError(e))
          }
        >
          <SaveIcon />
        </Fab>
      </Tooltip>
      <Tooltip title="Download Image">
        <Fab size="large" color="success" onClick={downloadSVG}>
          <AddAPhotoIcon />
        </Fab>
      </Tooltip>
    </Box>
  )
}

export default DomainActions
