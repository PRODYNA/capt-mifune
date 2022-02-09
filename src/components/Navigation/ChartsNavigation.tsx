import React, { useState } from 'react'
import {
  Theme,
  createStyles,
  Drawer,
  makeStyles,
  Typography,
  Box,
  IconButton,
} from '@material-ui/core'
import ArrowLeftIcon from '@material-ui/icons/ArrowLeft'
import { fontWhite } from '../Theme/CustomColors'

export const DRAWER_BUTTON = 110
export const DRAWER_WIDTH_OPEN = 620

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      '& .MuiPaper-root': {
        width: DRAWER_WIDTH_OPEN,
        color: fontWhite,
        overflow: 'hidden',
        backgroundColor: 'transparent',
        borderLeft: 'unset',
      },
      '&.closed': {
        '& .MuiPaper-root': {
          transition: 'all ease-in-out 0.4s',
          right: -DRAWER_WIDTH_OPEN + DRAWER_BUTTON,
        },
        '& + .MuiBox-root': {
          right: -DRAWER_WIDTH_OPEN + DRAWER_BUTTON,
          transition: 'all ease-in-out 0.4s',
        },
      },
      '&.open': {
        '& .MuiPaper-root': {
          transition: 'all ease-in-out 0.4s',
          right: 0,
        },
        '& + .MuiBox-root': {
          marginRight: DRAWER_WIDTH_OPEN,
          right: 0,
          transition: 'all ease-in-out 0.4s',
        },
      },
    },
    icon: {
      color: fontWhite,
    },
    toggleIcon: {
      position: 'absolute',
      color: 'white',
      backgroundColor: theme.palette.primary.main,
      height: '3rem',
      width: '7rem',
      borderRadius: 0,
      padding: '0.1rem 0.5rem 0 0',
      top: '50%',
      left: 0,
      '&:hover': {
        backgroundColor: theme.palette.primary.main,
        opacity: 0.9,
      },
    },
    navTitle: {
      fontWeight: 600,
      margin: '2rem auto',
    },
    listItem: {
      opacity: 0.6,
      '&.Mui-selected': {
        opacity: 1,
      },
    },
    wrapper: {
      overflowY: 'scroll',
    },
  })
)

const ChartsNavigation = (props: { children: JSX.Element[] }): JSX.Element => {
  const { children } = props
  const [openSidenav, setOpenSidenav] = useState<boolean>(false)
  const classes = useStyles()

  return (
    <Drawer
      variant="permanent"
      anchor="right"
      elevation={10}
      open={openSidenav}
      className={`${classes.root} ${openSidenav ? 'open' : 'closed'}`}
    >
      <IconButton
        className={classes.toggleIcon}
        onClick={() => setOpenSidenav(!openSidenav)}
      >
        <ArrowLeftIcon />
        <Typography variant="caption">Chart Options</Typography>
      </IconButton>
      <Box
        p={3}
        ml={14}
        bgcolor="white"
        height="100%"
        boxShadow={4}
        className={classes.wrapper}
      >
        {children}
      </Box>
    </Drawer>
  )
}

export default ChartsNavigation
