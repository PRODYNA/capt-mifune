import React from 'react'
import { createTheme, CssBaseline } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'

const theme = createTheme({
  typography: {
    htmlFontSize: 16,
    fontFamily: 'Roboto',
  },
  palette: {
    primary: {
      light: '#6573c3',
      dark: '#2c387e',
      main: '#3f51b5',
      contrastText: '#ffffff',
    },
    secondary: {
      light: '#4dabf5',
      main: '#2196f3',
      dark: '#1769aa',
      contrastText: '#ffffff',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
        },
        '::-webkit-scrollbar': {
          display: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          boxShadow: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          marginBottom: '0.5rem',
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          border: 'unset',
          padding: 0,
          boxShadow: 'none',
          minWidth: 250,
          width: '100%',
          marginBottom: '0.5rem',
          '&:not(:last-child)': {
            borderBottom: 0,
          },
          '&:before': {
            display: 'none',
          },
          '&$expanded': {
            marginTop: 0,
            marginBottom: '0.5rem',
          },
          '&.active': {
            border: `2px solid #6573c3`,
          },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          backgroundColor: 'white',
          border: 'unset',
          padding: '0.5rem 1rem',
          minHeight: 35,
          width: '100%',
          '&$expanded': {
            minHeight: 35,
          },
        },
        content: {
          justifyContent: 'space-between',
          alignItems: 'center',
          margin: 0,
          '& > .MuiSvgIcon-root': {
            fontSize: 20,
            transition: 'ease-in-out .3s',
          },
          '&$expanded': {
            '& > .MuiSvgIcon-root': {
              transform: 'rotate(90deg)',
            },
            margin: 0,
          },
        },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          display: 'block',
          padding: '1rem 1rem 0',
          backgroundColor: 'white',
        },
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
