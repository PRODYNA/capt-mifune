import React from 'react'
import { createTheme, CssBaseline } from '@material-ui/core'
import { ThemeProvider } from '@material-ui/core/styles'
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
  overrides: {
    MuiCssBaseline: {
      '@global': {
        body: {
          margin: 0,
        },
        '::-webkit-scrollbar': {
          display: 'none',
        },
      },
    },
    MuiButton: {
      root: {
        borderRadius: 0,
        boxShadow: 'none',
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
    MuiTableContainer: {
      root: {
        boxShadow: 'none',
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
