import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { prepareCmsClient } from './api/cms.js'
import './index.css'
import App from './App.jsx'

async function boot() {
  await prepareCmsClient()
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  )
}

boot()
