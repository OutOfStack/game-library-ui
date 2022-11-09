import React from 'react'
import { render, screen } from '@testing-library/react'
import App from './App'

test('renders header name', () => {
  render(<App />)
  const textElement = screen.getByText(/Game Library/i)
  expect(textElement).toBeInTheDocument()
})
