import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { StrictMode } from 'react'
import FireworksOverlay from './Game/firework.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FireworksOverlay />
    <App />
  </StrictMode>
)
