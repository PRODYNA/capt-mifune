import React from 'react'
import ExitToAppIcon from '@material-ui/icons/ExitToApp'
import { useOidc } from '@axa-fr/react-oidc'
import { ListItem, ListItemIcon, ListItemText } from '@material-ui/core'

const LogoutItem = (props: {
  className: string
  iconClass: string
}): JSX.Element => {
  const oidc = useOidc()
  const { className, iconClass } = props

  return (
    <ListItem
      button
      key="Logout"
      onClick={() => oidc.logout()}
      className={className}
      selected={false}
    >
      <ListItemIcon className={iconClass}>
        <ExitToAppIcon />
      </ListItemIcon>
      <ListItemText primary="Logout" />
    </ListItem>
  )
}

export default LogoutItem
