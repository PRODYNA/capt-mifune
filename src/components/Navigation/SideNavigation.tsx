import React, { useState } from 'react'
import { List, ListItem, ListItemIcon, ListItemText, Theme, createStyles, Drawer, makeStyles, Typography } from '@material-ui/core'
import BubbleChartIcon from "@material-ui/icons/BubbleChart";
import CloudUpload from "@material-ui/icons/CloudUpload";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import PieChartIcon from "@material-ui/icons/PieChart";
import RotateRightIcon from "@material-ui/icons/RotateRight";
import SaveIcon from "@material-ui/icons/Save";
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { useHistory, useLocation } from 'react-router';
import graphService from '../../api/GraphService';
import UserService from '../../services/UserService';
import { fontWhite } from '../Theme/CustomColors';
import { ANALYTCIS, PIPELINES, ROOT_PATH, UPLOAD } from '../../routes/routes';

const drawerWidth = 60;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      '& .MuiPaper-root': {
        width: drawerWidth,
        backgroundColor: theme.palette.primary.dark,
        color: fontWhite
      },
      '&.closed': {
        '& .MuiPaper-root': {
          transition: 'all ease-in-out 0.4s'
        },
        '& + .MuiContainer-root': {
          marginLeft: 0,
          transition: 'all ease-in-out 0.4s'
        }
      },
      '&.open': {
        '& .MuiPaper-root': {
          transition: 'all ease-in-out 0.4s',
          width: '160px',
        },
        '& + .MuiContainer-root': {
          marginLeft: '100px',
          transition: 'all ease-in-out 0.4s'
        }
      },
    },
    icon: {
      color: fontWhite
    },
    toggleIcon: {
      position: 'absolute',
      bottom: '2rem',
      left: '1rem'
    },
    navTitle: {
      fontWeight: 600,
      margin: '2rem auto',
    },
    listItem: {
      opacity: 0.6,
      '&.Mui-selected': {
        opacity: 1,
      }
    },
  }),
);

interface INavItems {
  title: string;
  icon: JSX.Element;
  path?: string;
  onClick?: () => void;
}

const Sidenavigation = (): JSX.Element => {
  const history = useHistory();
  const { pathname } = useLocation();

  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const navItems: INavItems[] = [
    { title: 'Graph', icon: <BubbleChartIcon />, path: ROOT_PATH },
    { title: 'Upload', icon: <CloudUpload />, path: UPLOAD },
    { title: 'Analytics', icon: <PieChartIcon />, path: ANALYTCIS },
    { title: 'Pipelines', icon: <RotateRightIcon />, path: PIPELINES },
    {
      title: 'Save', icon: <SaveIcon />,
      onClick: () => graphService.persistGraph().then((e) => console.log(e))
    }]

  const logoutItem = {
    title: 'Logout', icon: <ExitToAppIcon />,
    onClick: () => {
      UserService.doLogout({
        redirectUri: localStorage.getItem("ROOT_URL"),
      })
        .then((success: any) => {
          console.log("--> log: logout success ", success);
        })
        .catch((error: any) => {
          console.log("--> log: logout error ", error);
        });
    }
  }

  if (UserService.loginRequired()) navItems.push(logoutItem)

  return (
    <Drawer variant="permanent" open={open} className={`${classes.root} ${open ? 'open' : 'closed'}`}>
      <Typography color="inherit" variant="caption" className={classes.navTitle}>MiFune</Typography>
      <List>
        {navItems.map((item, index): JSX.Element => (
          <ListItem
            button key={item.title}
            onClick={() => { 
              if (item.path) history.push(item.path) 
              else item.onClick && item.onClick() 
            }}
            className={classes.listItem}
            selected={(item.path && pathname === item.path) || false}
            >
            <ListItemIcon className={classes.icon}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.title} />
          </ListItem>
        ))}
      </List>
      <ChevronRightIcon className={classes.toggleIcon} onClick={() => setOpen(!open)} />
    </Drawer>
  )
}

export default Sidenavigation