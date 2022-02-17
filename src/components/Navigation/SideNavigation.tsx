import React, { Dispatch, SetStateAction } from 'react'
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Theme,
  createStyles,
  Drawer,
  makeStyles,
  Typography,
} from '@material-ui/core'
import BubbleChartIcon from '@material-ui/icons/BubbleChart'
import CloudUpload from '@material-ui/icons/CloudUpload'
import ExitToAppIcon from '@material-ui/icons/ExitToApp'
import PieChartIcon from '@material-ui/icons/PieChart'
import RotateRightIcon from '@material-ui/icons/RotateRight'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import { useHistory, useLocation } from 'react-router-dom'
import UserService from '../../auth/UserService'
import { fontWhite } from '../Theme/CustomColors'
import { ANALYTCIS, PIPELINES, ROOT_PATH, UPLOAD } from '../../routes/routes'
import Logo from '../../assets/Logo.svg'

export const DRAWER_WIDTH = 60
export const DRAWER_WIDTH_OPEN = 170

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      '& .MuiPaper-root': {
        width: DRAWER_WIDTH,
        backgroundColor: theme.palette.primary.dark,
        color: fontWhite,
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
    },
    icon: {
      color: fontWhite,
    },
    toggleIcon: {
      position: 'absolute',
      bottom: '2rem',
      right: '1rem',
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
    logo: {
      width: '70%',
      margin: '0 auto',
      display: 'block',
    },
  })
)

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
  const history = useHistory()
  const { pathname } = useLocation()
  const classes = useStyles()
  const navItems: INavItems[] = [
    { title: 'Graph', icon: <BubbleChartIcon />, path: ROOT_PATH },
    { title: 'Upload', icon: <CloudUpload />, path: UPLOAD },
    { title: 'Pipelines', icon: <RotateRightIcon />, path: PIPELINES },
    { title: 'Analytics', icon: <PieChartIcon />, path: ANALYTCIS },
  ]

  const logoutItem = {
    title: 'Logout',
    icon: <ExitToAppIcon />,
    onClick: () => {
      UserService.doLogout({
        redirectUri: localStorage.getItem('ROOT_URL'),
      })
        .then((success: any) => {
          console.log('--> log: logout success ', success)
        })
        .catch((error: any) => {
          console.log('--> log: logout error ', error)
        })
    },
  }

  if (UserService.loginRequired()) navItems.push(logoutItem)

  return (
    <Drawer
      variant="permanent"
      open={openSidenav}
      className={`${classes.root} ${openSidenav ? 'open' : 'closed'}`}
    >
      <Typography
        color="inherit"
        variant="caption"
        className={classes.navTitle}
      >
        <img src={Logo} alt="logo" className={classes.logo} />
      </Typography>
      <List>
        {navItems.map(
          (item): JSX.Element => (
            <ListItem
              button
              key={item.title}
              onClick={() => {
                if (item.path) history.push(item.path)
                if (item.onClick) item.onClick()
              }}
              className={classes.listItem}
              selected={(item.path && pathname === item.path) || false}
            >
              <ListItemIcon className={classes.icon}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.title} />
            </ListItem>
          )
        )}
      </List>
      <ChevronRightIcon
        className={classes.toggleIcon}
        onClick={() => setOpenSidenav(!openSidenav)}
      />
    </Drawer>
  )
}

export default Sidenavigation
