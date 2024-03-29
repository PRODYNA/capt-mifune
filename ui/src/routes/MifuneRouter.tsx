import React, { useState } from 'react'
import { Box } from '@material-ui/core'
import { Route, Routes } from 'react-router-dom'
import { OidcSecure } from '@axa-fr/react-oidc'
import { Analytics } from '../pages/analytics/Analytics'
import { Graph } from '../pages/graph/Graph'
import Sidenavigation from '../components/Navigation/SideNavigation'
import Pipelines from '../pages/pipeline/Pipelines'
import PipelinesDetail from '../pages/pipeline/PipelinesDetail'
import SnackbarProvider from '../context/Snackbar'
import Upload from '../pages/Upload'
import { ANALYTCIS, PIPELINE, PIPELINES, ROOT_PATH, UPLOAD } from './routes'
import ErrorBoundary from '../components/Error/ErrorBoundaries'

const MifuneRouter = (): JSX.Element => {
  const [openSidenav, setOpenSidenav] = useState(false)

  function getContent(): JSX.Element {
    return (
      <>
        <Sidenavigation
          openSidenav={openSidenav}
          setOpenSidenav={setOpenSidenav}
        />
        <Box position="relative" height="100vh">
          <Routes>
            <Route
              errorElement={<ErrorBoundary />}
              path={ROOT_PATH}
              element={
                <ErrorBoundary>
                  <Graph openSidenav={openSidenav} />
                </ErrorBoundary>
              }
            />
            <Route
              path={ANALYTCIS}
              element={
                <ErrorBoundary>
                  <Analytics />
                </ErrorBoundary>
              }
            />
            <Route
              path={UPLOAD}
              element={
                <ErrorBoundary>
                  <Upload />
                </ErrorBoundary>
              }
            />
            <Route
              path={`${PIPELINE}/:id`}
              element={
                <ErrorBoundary>
                  <PipelinesDetail />
                </ErrorBoundary>
              }
            />
            <Route
              path={PIPELINES}
              element={
                <ErrorBoundary>
                  <Pipelines />
                </ErrorBoundary>
              }
            />
          </Routes>
        </Box>
      </>
    )
  }

  function getOidcSecure(content: JSX.Element = getContent()): JSX.Element {
    if (window.env.oidc.disabled) {
      return content
    }
    return <OidcSecure>{content}</OidcSecure>
  }

  return <SnackbarProvider>{getOidcSecure(getContent())}</SnackbarProvider>
}

export default MifuneRouter
