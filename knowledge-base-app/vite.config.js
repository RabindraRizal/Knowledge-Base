import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // VITE_BASE_URL is set by GitHub Actions to /Knowledge-Base/ for Pages
  base: process.env.VITE_BASE_URL || '/',
})
