import React from 'react'
import { createTheme, CssBaseline } from '@material-ui/core'
import { ThemeProvider } from '@material-ui/core/styles'
import { Shadows } from '@material-ui/core/styles/shadows'
import {
  fontWhite,
  primaryDark,
  primaryLight,
  primaryMain,
  secondaryDark,
  secondaryLight,
  secondaryMain,
} from './CustomColors'

const theme = createTheme({
  typography: {
    htmlFontSize: 16,
    fontFamily: 'Roboto',
  },
  palette: {
    primary: {
      light: primaryLight,
      dark: primaryDark,
      main: primaryMain,
      contrastText: fontWhite,
    },
    secondary: {
      light: secondaryLight,
      main: secondaryMain,
      dark: secondaryDark,
      contrastText: fontWhite,
    },
  },
  shadows: Array(25).fill('none') as Shadows,
  overrides: {
    MuiCssBaseline: {
      '@global': {
        body: {
          margin: 0,
        },
      },
    },
    MuiButton: {
      root: {
        borderRadius: 0,
      },
    },
    MuiPaper: {
      root: {
        borderRadius: 0,
      },
    },
    MuiFormControl: {
      root: {
        marginBottom: '0.5rem',
      },
    },
  },
})
interface MifuneThemeProps {
  children: JSX.Element
}

const MifuneTheme = (props: MifuneThemeProps): JSX.Element => {
  const { children } = props
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}

export default MifuneTheme
