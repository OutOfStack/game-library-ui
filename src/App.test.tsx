import React from 'react'
import { render, screen } from '@testing-library/react'
import App from './App'

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: query === '(prefers-color-scheme: dark)', // Simulate dark mode matches
      media: query,
      onchange: null,
      addListener: jest.fn(), // For older APIs
      removeListener: jest.fn(), // For older APIs
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn()
    }))
  })
})

test('renders header name', () => {
  render(<App />)
  const textElement = screen.getByText(/Game Library/i)
  expect(textElement).toBeInTheDocument()
})
