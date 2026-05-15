import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { InviteGate } from './shell/InviteGate'
import './styles/index.css'

const root = document.getElementById('root')
if (!root) throw new Error('root element not found')

createRoot(root).render(
  <StrictMode>
    <InviteGate>
      <App />
    </InviteGate>
  </StrictMode>
)
