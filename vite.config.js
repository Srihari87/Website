import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves the site under /Website/; Vercel serves it from the root.
// Vercel sets VERCEL=1 during its builds, so each host gets the right base path.
export default defineConfig({
  plugins: [react()],
  base: process.env.VERCEL ? '/' : '/Website/',
})
