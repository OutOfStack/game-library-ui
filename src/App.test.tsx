import { render, screen } from '@testing-library/react'
import { test, expect } from 'vitest'
import App from './App'

test('renders the app component', () => {
  render(<App />)
  const textElement = screen.getByText(/Game Library/i)
  expect(textElement).toBeInTheDocument()
})
