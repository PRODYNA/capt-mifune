import React from 'react'
import { Container, Box } from '@material-ui/core'
import { Switch, Route } from 'react-router-dom'
import { Analytics } from '../components/analytics/Analytics'
import { Graph } from '../components/graph/Graph'
import Sidenavigation from '../components/Navigation/SideNavigation'
import { Pipelines } from '../components/pipeline/Pipelines'
import { PipelinesDetail } from '../components/pipeline/PipelinesDetail'
import SnackbarProvider from '../context/Snackbar'
import Upload from '../pages/Upload'
import { ANALYTCIS, PIPELINE, PIPELINES, ROOT_PATH, UPLOAD } from './routes'


const MifuneRouter = (): JSX.Element => {
  return (
    <>
      <Sidenavigation />
      <SnackbarProvider>
        <Container>
          <Box ml={5}>
            <Switch>
              <Route path={ROOT_PATH} exact>
                <Graph />
              </Route>
              <Route path={ANALYTCIS}>
                <Analytics />
              </Route>
              <Route path={UPLOAD}>
                <Upload />
              </Route>
              <Route path={PIPELINES} exact>
                <Pipelines />
              </Route>
              <Route path={`${PIPELINE}/:id`}>
                <PipelinesDetail />
              </Route>
            </Switch>
          </Box>
        </Container>
      </SnackbarProvider>
    </>
  )
}

export default MifuneRouter
