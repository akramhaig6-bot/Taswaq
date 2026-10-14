import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/cairo'
import '@/index.css'
import App from '@/App'

document.getElementById('boot')?.remove()

const container = document.getElementById('root')
if (!container) throw new Error('Root container #root is missing')

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
