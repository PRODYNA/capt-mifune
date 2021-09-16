import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import HttpService from "./services/HttpService";
import UserService from "./services/UserService";

export async function loadEnv(): Promise<void> {
  await fetch("/env.json")
    .then((r) => r.json())
    .then((env) => {
      Object.keys(env).forEach((k) => {
        localStorage.setItem(k, env[k]);
      });
    });
}

const renderApp = () => {
  loadEnv().then(() => {
    ReactDOM.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
      document.getElementById("root")
    );
  });
};

UserService.initKeycloak(renderApp);
HttpService.configure();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
