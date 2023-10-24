import { useOidc } from '@axa-fr/react-oidc'
import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
} from '@mui/material'
import { LogoutIcon } from '../Icons/CustomIcons'

const LogoutItem = (): JSX.Element => {
  const oidc = useOidc()
  const theme = useTheme()

  return (
    <ListItemButton
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
        <LogoutIcon />
      </ListItemIcon>
      <ListItemText primary="Logout" />
    </ListItemButton>
  )
}

export default LogoutItem
