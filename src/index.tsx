import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import reportWebVitals from './reportWebVitals'
import HttpService from './openapi/HttpService'
import UserService from './auth/UserService'
import MifuneTheme from './components/Theme/MifuneTheme'

export async function loadEnv(): Promise<void> {
  await fetch('env.json')
    .then((r) => r.json())
    .then((env) => {
      Object.keys(env).forEach((k) => {
        localStorage.setItem(k, env[k])
      })
    })
}

const renderApp = (): void => {
  ReactDOM.render(
    <React.StrictMode>
      <MifuneTheme>
        <App />
      </MifuneTheme>
    </React.StrictMode>,
    document.getElementById('root')
  )
}

loadEnv().then(() => {
  if (UserService.loginRequired()) {
    UserService.initKeycloak(renderApp)
    HttpService.configure()
  } else {
    renderApp()
  }
})

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
