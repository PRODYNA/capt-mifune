import React, { useState } from 'react'
import { Box } from '@material-ui/core'
import { Switch, Route } from 'react-router-dom'
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

  return (
    <SnackbarProvider>
      <>
        <Sidenavigation
          openSidenav={openSidenav}
          setOpenSidenav={setOpenSidenav}
        />
        <Box position="relative" height="100vh">
          <Switch>
            <Route path={ROOT_PATH} exact>
              <ErrorBoundary>
                <Graph openSidenav={openSidenav} />
              </ErrorBoundary>
            </Route>
            <Route path={ANALYTCIS}>
              <ErrorBoundary>
                <Analytics />
              </ErrorBoundary>
            </Route>
            <Route path={UPLOAD}>
              <ErrorBoundary>
                <Upload />
              </ErrorBoundary>
            </Route>
            <Route path={`${PIPELINE}/:id`}>
              <ErrorBoundary>
                <PipelinesDetail />
              </ErrorBoundary>
            </Route>
            <Route path={PIPELINES} exact>
              <ErrorBoundary>
                <Pipelines />
              </ErrorBoundary>
            </Route>
          </Switch>
        </Box>
      </>
    </SnackbarProvider>
  )
}

export default MifuneRouter
