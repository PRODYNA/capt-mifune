import React from 'react';
import './App.css';
import {Graph} from "./graph/Graph";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import {Pipelines} from "./pipeline/Pipelines";
import {PipelinesDetail} from "./pipeline/PipelinesDetail";




function App() {
  return (
      <Router>
        <div>

          {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
          <Switch>
            <Route path="/" exact={true} component={Graph}/>
            <Route path="/pipelines" component={Pipelines}  />
            <Route path="/pipeline/:id" component={PipelinesDetail}  />

          </Switch>
        </div>
      </Router>
  );
}

export default App;
