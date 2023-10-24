import React, { createContext, useState } from 'react'
import { Snackbar } from '@mui/material'
import MuiAlert from '@mui/material/Alert'
import { AxiosError } from 'axios'
import { Translations } from '../utils/Translations'

type SnackBarContextActions = {
  openSnackbar: (
    text: string,
    severity: 'success' | 'info' | 'warning' | 'error'
  ) => void
  openSnackbarError: (e: AxiosError) => void
  closeSnackbar: () => void
}

// Context used by the hook useSnackbar()
export const SnackbarContext = createContext({} as SnackBarContextActions)

interface SnackbarProviderProps {
  children: JSX.Element
}

const SnackbarProvider = (props: SnackbarProviderProps): JSX.Element => {
  const { children } = props
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [severity, setSeverity] = useState<
    'success' | 'info' | 'warning' | 'error'
  >('warning')

  const triggerSnackbar = (
    m: string,
    s: 'success' | 'info' | 'warning' | 'error'
  ): void => {
    setText(m)
    setSeverity(s)
    setOpen(true)
  }

  // Manages all the snackbar's opening process
  const openSnackbar = (
    m: string,
    s: 'success' | 'info' | 'warning' | 'error'
  ): void => {
    // Closes the snackbar if it is already open
    if (open) {
      setOpen(false)
      setTimeout(() => {
        triggerSnackbar(m, s)
      }, 300)
    } else {
      triggerSnackbar(m, s)
    }
  }

  const openSnackbarError = (e: AxiosError): void => {
    const { response }: any = e
    if (response?.data.message) setText(response?.data.message)
    else setText(Translations.UNKNOWN_ERROR)
    setSeverity('error')
    if (open) {
      setOpen(false)
      setTimeout(() => {
        setOpen(true)
      }, 300)
    } else {
      setOpen(true)
    }
  }

  // Closes the snackbar just by setting the "open" state to false
  const closeSnackbar = (): void => {
    setOpen(false)
  }

  // Returns the Provider that must wrap the application
  return (
    <SnackbarContext.Provider
      value={{ openSnackbar, closeSnackbar, openSnackbarError }}
    >
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={open}
        autoHideDuration={4000}
        onClose={closeSnackbar}
      >
        <MuiAlert elevation={6} variant="filled" severity={severity}>
          {text}
        </MuiAlert>
      </Snackbar>

      {children}
    </SnackbarContext.Provider>
  )
}

export default SnackbarProvider
