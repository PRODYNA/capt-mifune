import { Dispatch, SetStateAction } from 'react'
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
import { useNavigate, useLocation } from 'react-router-dom'
import { ANALYTCIS, PIPELINES, ROOT_PATH, UPLOAD } from '../../routes/routes'
import Logo from '../../assets/Logo.svg'
import LogoutItem from './LogoutItem'
import oidcConfig from '../../auth/oidcConfig'
import {
  AnalyticsIcon,
  GraphIcon,
  MenuCollapseIcon,
  PipelineIcon,
  CustomUploadIcon,
} from '../Icons/CustomIcons'

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
    { title: 'Graph', icon: <GraphIcon />, path: ROOT_PATH },
    { title: 'Upload', icon: <CustomUploadIcon />, path: UPLOAD },
    { title: 'Pipelines', icon: <PipelineIcon />, path: PIPELINES },
    { title: 'Analytics', icon: <AnalyticsIcon />, path: ANALYTCIS },
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
      open={openSidenav}
      variant="permanent"
      className={`${openSidenav ? 'open' : 'closed'}`}
      sx={{
        '& .MuiPaper-root': {
          backgroundColor: theme.palette.primary.dark,
          color: theme.palette.common.white,
          overflow: 'hidden',
        },
        '&.closed': {
          width: DRAWER_WIDTH,
          transition: 'all ease-in-out 0.4s',

          '& .MuiPaper-root': {
            width: DRAWER_WIDTH,
            transition: 'all ease-in-out 0.4s',
          },
          '& + .MuiBox-root': {
            width: `calc(100% - ${DRAWER_WIDTH}px)`,
          },
        },
        '&.open': {
          width: DRAWER_WIDTH_OPEN,
          transition: 'all ease-in-out 0.4s',

          '& .MuiPaper-root': {
            transition: 'all ease-in-out 0.4s',
            width: DRAWER_WIDTH_OPEN,
          },
          '& + .MuiBox-root': {
            width: `calc(100% - ${DRAWER_WIDTH_OPEN}px)`,
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
      <MenuCollapseIcon
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
