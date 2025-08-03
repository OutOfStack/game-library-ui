// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'
import { vi } from 'vitest'
import { TextEncoder, TextDecoder } from 'util'


if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder as unknown as typeof global.TextDecoder
}

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: query === '(prefers-color-scheme: dark)', // Simulate dark mode matches
    media: query,
    onchange: null,
    addListener: vi.fn(), // For older APIs
    removeListener: vi.fn(), // For older APIs
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock environment variables
Object.defineProperty(window, '_env_', {
  writable: true,
  value: {
    GOOGLE_CLIENT_ID: 'test-google-client-id',
    GAMES_URL: 'http://localhost:8000',
    AUTH_URL: 'http://localhost:8001'
  }
})
