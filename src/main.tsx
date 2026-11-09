import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Development-only handle for automated browser checks.
if (import.meta.env.DEV) {
  void import('./store/gameStore').then((m) => { (window as unknown as { __game: unknown }).__game = m.useGame })
}
