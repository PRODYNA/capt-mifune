import React, { Dispatch, SetStateAction } from 'react'
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Drawer,
  Typography,
  useTheme,
  Box,
} from '@mui/material'
import BubbleChartIcon from '@mui/icons-material/BubbleChart'
import CloudUpload from '@mui/icons-material/CloudUpload'
import PieChartIcon from '@mui/icons-material/PieChart'
import RotateRightIcon from '@mui/icons-material/RotateRight'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { useNavigate, useLocation } from 'react-router-dom'
import { ANALYTCIS, PIPELINES, ROOT_PATH, UPLOAD } from '../../routes/routes'
import Logo from '../../assets/Logo.svg'
import LogoutItem from './LogoutItem'
import oidcConfig from '../../auth/oidcConfig'

export const DRAWER_WIDTH = 60
export const DRAWER_WIDTH_OPEN = 170
interface ISidenav {
  openSidenav: boolean
  setOpenSidenav: Dispatch<SetStateAction<boolean>>
}

interface INavItems {
  title: string
  icon: JSX.Element
  path?: string
  onClick?: () => void
}

const Sidenavigation = (props: ISidenav): JSX.Element => {
  const { openSidenav, setOpenSidenav } = props
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const theme = useTheme()
  // const { logout } = useOidc()
  const navItems: INavItems[] = [
    { title: 'Graph', icon: <BubbleChartIcon />, path: ROOT_PATH },
    { title: 'Upload', icon: <CloudUpload />, path: UPLOAD },
    { title: 'Pipelines', icon: <RotateRightIcon />, path: PIPELINES },
    { title: 'Analytics', icon: <PieChartIcon />, path: ANALYTCIS },
  ]

  function buildNavItem(item: INavItems): JSX.Element {
    return (
      <ListItem
        button
        key={item.title}
        onClick={() => {
          if (item.path) navigate(item.path)
          if (item.onClick) item.onClick()
        }}
        sx={{
          opacity: 0.6,
          '&.Mui-selected': {
            opacity: 1,
          },
        }}
        selected={(item.path && pathname === item.path) || false}
      >
        <ListItemIcon
          sx={{
            color: theme.palette.common.white,
          }}
        >
          {item.icon}
        </ListItemIcon>
        <ListItemText primary={item.title} />
      </ListItem>
    )
  }

  function buildLogout(): JSX.Element {
    if (oidcConfig.disabled) {
      return <Box />
    }
    return <LogoutItem />
  }

  return (
    <Drawer
      variant="permanent"
      open={openSidenav}
      className={`${openSidenav ? 'open' : 'closed'}`}
      sx={{
        '& .MuiPaper-root': {
          width: DRAWER_WIDTH,
          backgroundColor: theme.palette.primary.dark,
          color: theme.palette.common.white,
          overflow: 'hidden',
        },
        '&.closed': {
          '& .MuiPaper-root': {
            transition: 'all ease-in-out 0.4s',
          },
          '& + .MuiBox-root': {
            marginLeft: DRAWER_WIDTH,
            width: `calc(100% - ${DRAWER_WIDTH}px)`,
            transition: 'all ease-in-out 0.4s',
          },
        },
        '&.open': {
          '& .MuiPaper-root': {
            transition: 'all ease-in-out 0.4s',
            width: DRAWER_WIDTH_OPEN,
          },
          '& + .MuiBox-root': {
            marginLeft: DRAWER_WIDTH_OPEN,
            width: `calc(100% - ${DRAWER_WIDTH_OPEN}px)`,
            transition: 'all ease-in-out 0.4s',
          },
        },
      }}
    >
      <Typography
        color="inherit"
        variant="caption"
        sx={{
          fontWeight: 600,
          margin: '2rem auto',
        }}
      >
        <Box
          sx={{
            '& img': {
              width: '70%',
              margin: '0 auto',
              display: 'block',
            },
          }}
        >
          <img src={Logo} alt="logo" />
        </Box>
      </Typography>
      <List>
        {navItems.map((item) => buildNavItem(item))}
        {buildLogout()}
      </List>
      <ChevronRightIcon
        sx={{
          position: 'absolute',
          bottom: '2rem',
          right: '1rem',
        }}
        onClick={() => setOpenSidenav(!openSidenav)}
      />
    </Drawer>
  )
}

export default Sidenavigation
