/// <reference types="vitest" />

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react()
  ],
  server: {
    port: 3000,
  },
  build: {
    outDir: 'build',
  },
  test: {
    globals: true, // Use globals like `describe` and `test` without importing
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  }
})
