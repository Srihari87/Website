import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { Analytics } from '@vercel/analytics/react'

// Umami analytics: only loads when a website ID is configured (set
// VITE_UMAMI_WEBSITE_ID in Vercel's environment variables).
const umamiId = import.meta.env.VITE_UMAMI_WEBSITE_ID
if (umamiId) {
  const script = document.createElement('script')
  script.defer = true
  script.src = import.meta.env.VITE_UMAMI_SCRIPT_URL || 'https://cloud.umami.is/script.js'
  script.dataset.websiteId = umamiId
  document.head.appendChild(script)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Analytics />
  </StrictMode>,
)