import React from "react";
import "./App.css";
import { BrowserRouter } from "react-router-dom";
import MifuneRouter from "./routes/Router";

function App() {
  return (
    <BrowserRouter>
      <MifuneRouter />
    </BrowserRouter >
  );
}

export default App;
