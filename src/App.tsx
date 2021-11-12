import React from "react";
import "./App.css";

import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Graph } from "./components/graph/Graph";
import { Pipelines } from "./components/pipeline/Pipelines";
import { PipelinesDetail } from "./components/pipeline/PipelinesDetail";
import { Analytics } from "./components/analytics/Analytics";
import { Box, Container } from "@material-ui/core";
import Sidenavigation from "./components/Navigation/SideNavigation";
import Upload from "./pages/Upload";

function App() {
  return (
    <Router>
      <Sidenavigation />
      <Container>
        <Box ml={5}>
          <Switch>
            <Route path="/" exact component={Graph} />
            <Route path="/analytics" component={Analytics} />
            <Route path="/upload" component={Upload} />
            <Route path="/pipelines" component={Pipelines} />
            <Route path="/pipeline/:id" component={PipelinesDetail} />
          </Switch>
        </Box>
      </Container>
    </Router >
  );
}

export default App;
