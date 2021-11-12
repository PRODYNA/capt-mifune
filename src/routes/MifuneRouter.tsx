import { Container, Box } from '@material-ui/core'
import React from 'react'
import { Switch, Route } from 'react-router-dom'
import { Analytics } from '../components/analytics/Analytics'
import { Graph } from '../components/graph/Graph'
import Sidenavigation from '../components/Navigation/SideNavigation'
import { Pipelines } from '../components/pipeline/Pipelines'
import { PipelinesDetail } from '../components/pipeline/PipelinesDetail'
import Upload from '../pages/Upload'
import { ANALYTCIS, PIPELINES, ROOT_PATH, UPLOAD } from './routes'


const MifuneRouter = (): JSX.Element => {
  return (
    <>
      <Sidenavigation />
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
            <Route path={`${PIPELINES}/:id`}>
              <PipelinesDetail />
            </Route>
          </Switch>
        </Box>
      </Container>
    </>
  )
}

export default MifuneRouter
