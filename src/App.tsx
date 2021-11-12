import React from "react";
import { BrowserRouter } from "react-router-dom";
import MifuneRouter from "./routes/MifuneRouter";

function App() {
  return (
    <BrowserRouter>
      <MifuneRouter />
    </BrowserRouter >
  );
}

export default App;
