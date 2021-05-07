import React from "react";
import "./App.css";

import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import { Graph } from "./components/graph/Graph";
import { Pipelines } from "./components/pipeline/Pipelines";
import { PipelinesDetail } from "./components/pipeline/PipelinesDetail";
import { Navigation } from "./components/navigation/Navigation";

function App() {
  return (
    <Router>
      <div>
        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          <Route path="/" exact={true} component={Graph} />
          <Route path="/pipelines" component={Pipelines} />
          <Route path="/pipeline/:id" component={PipelinesDetail} />
        </Switch>
      </div>
      <Navigation></Navigation>
    </Router>
  );
}

export default App;
