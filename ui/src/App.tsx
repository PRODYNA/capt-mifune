import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import MifuneRouter from './routes/MifuneRouter'
import AuthenticationWrapper from './auth/AuthenticationWrapper'

function App(): JSX.Element {
  function getBrowserRouter(): JSX.Element {
    return (
      <BrowserRouter>
        <MifuneRouter />
      </BrowserRouter>
    )
  }
  function getAuthenticationWrapper(content: JSX.Element): JSX.Element {
    if (window.env.oidc.disabled) {
      return content
    }
    return <AuthenticationWrapper>{content}</AuthenticationWrapper>
  }

  return getAuthenticationWrapper(getBrowserRouter())
}

export default App
