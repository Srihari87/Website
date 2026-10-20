import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { Analytics } from '@vercel/analytics/react'

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