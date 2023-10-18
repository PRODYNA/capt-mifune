import { useState } from 'react'
import { Drawer, Typography, Box, IconButton, useTheme } from '@mui/material'
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft'

export const DRAWER_BUTTON = 110
export const DRAWER_WIDTH_OPEN = 650

const ChartsNavigation = (props: { children: JSX.Element[] }): JSX.Element => {
  const { children } = props
  const [openSidenav, setOpenSidenav] = useState<boolean>(false)
  const theme = useTheme()
  return (
    <Drawer
      variant="permanent"
      anchor="right"
      elevation={10}
      open={openSidenav}
      sx={{
        '& .MuiPaper-root': {
          width: DRAWER_WIDTH_OPEN,
          color: theme.palette.common.white,
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
      }}
      className={`${openSidenav ? 'open' : 'closed'}`}
    >
      <IconButton
        onClick={() => setOpenSidenav(!openSidenav)}
        sx={{
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
        }}
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
        sx={{
          overflowY: 'scroll',
        }}
      >
        {children}
      </Box>
    </Drawer>
  )
}

export default ChartsNavigation
