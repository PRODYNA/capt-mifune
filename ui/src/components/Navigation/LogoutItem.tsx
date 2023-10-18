import React from 'react'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import { useOidc } from '@axa-fr/react-oidc'
import { ListItem, ListItemIcon, ListItemText, useTheme } from '@mui/material'

const LogoutItem = (): JSX.Element => {
  const oidc = useOidc()
  const theme = useTheme()

  return (
    <ListItem
      button
      key="Logout"
      onClick={() => oidc.logout()}
      sx={{
        opacity: 0.6,
        '&.Mui-selected': {
          opacity: 1,
        },
      }}
      selected={false}
    >
      <ListItemIcon
        sx={{
          color: theme.palette.common.white,
        }}
      >
        <ExitToAppIcon />
      </ListItemIcon>
      <ListItemText primary="Logout" />
    </ListItem>
  )
}

export default LogoutItem
