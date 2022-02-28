import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import MifuneRouter from './routes/MifuneRouter'

function App(): JSX.Element {
  return (
    <BrowserRouter>
      <MifuneRouter />
    </BrowserRouter>
  )
}

export default App
