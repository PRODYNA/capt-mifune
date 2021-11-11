import React, { useState } from 'react'
import { List, ListItem, ListItemIcon, ListItemText, Theme, createStyles, Drawer, makeStyles, Typography } from '@material-ui/core'
import BubbleChartIcon from "@material-ui/icons/BubbleChart";
import CloudUpload from "@material-ui/icons/CloudUpload";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import PieChartIcon from "@material-ui/icons/PieChart";
import RotateRightIcon from "@material-ui/icons/RotateRight";
import SaveIcon from "@material-ui/icons/Save";
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { useHistory } from 'react-router';
import graphService from '../../api/GraphService';
import UserService from '../../services/UserService';
import { fontWhite } from '../Theme/CustomColors';

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
    }
  }),
);

const Sidenavigation = (): JSX.Element => {
  const history = useHistory();
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const navItems = [
    { title: 'Graph', icon: <BubbleChartIcon />, onClick: () => history.push("/") },
    { title: 'Upload', icon: <CloudUpload />, onClick: () => history.push("/upload") },
    { title: 'Analytics', icon: <PieChartIcon />, onClick: () => history.push("/analytics") },
    { title: 'Pipelines', icon: <RotateRightIcon />, onClick: () => history.push("/pipelines") },
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

  if(UserService.loginRequired()) navItems.push(logoutItem)

  return (
    <Drawer variant="permanent" open={open} className={`${classes.root} ${open ? 'open' : 'closed'}`}>
      <Typography color="inherit" variant="caption" className={classes.navTitle}>MiFune</Typography>
      <List>
        {navItems.map((item, index): JSX.Element => (
          <ListItem button key={item.title} onClick={item.onClick || undefined}>
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