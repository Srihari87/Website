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

// Skip my own visits: run localStorage.setItem('va-disable', '1') once in
// this browser's console and Vercel Analytics stops counting it.
const skipOwnVisits = (event) => {
  try {
    if (localStorage.getItem('va-disable')) return null
  } catch {
    // storage blocked: count the visit
  }
  return event
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Analytics beforeSend={skipOwnVisits} />
  </StrictMode>,
)