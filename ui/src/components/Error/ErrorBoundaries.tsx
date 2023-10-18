import React from 'react'
import { Box, Typography } from '@mui/material'
import ErrorMessage from './ErrorMessage'

interface ErrorBoundaryState {
  hasError: boolean
  error: string
}

interface Error {
  stack?: string
}

export default class ErrorBoundary extends React.Component<
  Record<string, unknown>,
  ErrorBoundaryState
> {
  constructor(props: Record<string, unknown>) {
    super(props)
    this.state = { hasError: false, error: '' }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error: error.toString() }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // You can also log the error to an error reporting service
    this.setState({ hasError: true, error: `${error} - ${errorInfo}` })
  }

  render(): React.ReactNode {
    const { hasError, error } = this.state
    const { children } = this.props

    if (hasError) {
      return (
        <>
          <ErrorMessage />
          <Typography variant="caption">{error}</Typography>
        </>
      )
    }

    return children as React.ReactNode
  }
}
