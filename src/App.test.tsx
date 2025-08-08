import { render, screen } from '@testing-library/react'
import { test, expect } from 'vitest'
import App from './App'

test('renders the app component', async () => {
  render(<App />)
  const textElement = await screen.findByText(/Game Library/i, undefined, { timeout: 4000 })
  expect(textElement).toBeInTheDocument()
})
