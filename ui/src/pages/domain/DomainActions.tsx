import React, { Dispatch, SetStateAction, useContext } from 'react'
import {
  Tooltip,
  Fab,
  createStyles,
  makeStyles,
  Box,
  Theme,
} from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add'
import SaveIcon from '@material-ui/icons/Save'
import AddAPhotoIcon from '@material-ui/icons/AddAPhoto'
import { SnackbarContext } from '../../context/Snackbar'
import { Translations } from '../../utils/Translations'
import { Domain } from '../../services/models/domain'
import AXIOS_CONFIG from '../../openapi/axios-config'
import { GraphApi, DomainApi } from '../../services'

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    wrapper: {
      transform: 'translateX(-50%)',
    },
    animatedBtn: {
      animation: '$pulse-purple 2s infinite',
    },
    save: {
      backgroundColor: theme.palette.success.main,
      color: 'white',
      marginLeft: '1rem',
      '&:hover': {
        backgroundColor: theme.palette.success.main,
        color: 'white',
        opacity: 0.8,
      },
    },
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
  })
)

interface IDomainActions {
  domains: Domain[]
  setDomains: Dispatch<SetStateAction<Domain[]>>
  setSelectedDomain: Dispatch<SetStateAction<Domain | undefined>>
  downloadSVG: () => void
}

const DomainActions = (props: IDomainActions): JSX.Element => {
  const { domains, setDomains, setSelectedDomain, downloadSVG } = props
  const { openSnackbar, openSnackbarError } = useContext(SnackbarContext)
  const domainApi = new DomainApi(AXIOS_CONFIG())
  const graphApi = new GraphApi(AXIOS_CONFIG())
  const classes = useStyles()

  return (
    <Box
      position="absolute"
      bottom="1rem"
      left="50%"
      className={classes.wrapper}
    >
      <Tooltip title="Create new Domain">
        <Fab
          size="large"
          color="primary"
          className={` ${domains.length === 0 ? classes.animatedBtn : ''}`}
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
          className={classes.save}
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
        <Fab size="large" className={classes.save} onClick={downloadSVG}>
          <AddAPhotoIcon />
        </Fab>
      </Tooltip>
    </Box>
  )
}

export default DomainActions
