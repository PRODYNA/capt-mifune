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
import graphService from '../../api/GraphService'
import { Domain } from '../../api/model/Model'
import { SnackbarContext } from '../../context/Snackbar'
import { Translations } from '../../utils/Translations'

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
}

const DomainActions = (props: IDomainActions): JSX.Element => {
  const { domains, setDomains, setSelectedDomain } = props
  const { openSnackbar, openSnackbarError } = useContext(SnackbarContext)
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
            graphService
              .domainPost({ name: `domain_${domains.length}` })
              .then((domain) => {
                setDomains(domains.concat(domain))
                setSelectedDomain(domain)
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
            graphService
              .persistGraph()
              .then(() => openSnackbar(Translations.SAVE, 'success'))
              .catch((e) => openSnackbarError(e))
          }
        >
          <SaveIcon />
        </Fab>
      </Tooltip>
    </Box>
  )
}

export default DomainActions
