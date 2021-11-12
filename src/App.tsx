import React from "react";
import "./App.css";

import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Graph } from "./components/graph/Graph";
import { Pipelines } from "./components/pipeline/Pipelines";
import { PipelinesDetail } from "./components/pipeline/PipelinesDetail";
import { Navigation } from "./components/navigation/Navigation";
import { Analytics } from "./components/analytics/Analytics";
import { Container } from "@material-ui/core";

function App() {
  return (
    <Router>
      <Container>
        <Switch>
          <Route path="/" exact component={Graph} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/pipelines" component={Pipelines} />
          <Route path="/pipeline/:id" component={PipelinesDetail} />
        </Switch>
      </Container>
      <Navigation></Navigation>
    </Router>
  );
}

export default App;
