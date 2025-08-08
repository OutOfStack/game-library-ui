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

// Mock fetch for tests to avoid real network
const mockResponse = (data: unknown, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  headers: { get: (_: string) => (data ? '10' : '0') },
  json: async () => data
}) as unknown as Response

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
global.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input.toString()
  // Games list and game endpoints
  if (url.includes('/api/games')) {
    // list or details; return minimal shape for list
    return mockResponse({ games: [], count: 0 })
  }
  // Genres
  if (url.includes('/api/genres')) {
    return mockResponse([])
  }
  // Companies (top devs/pubs)
  if (url.includes('/api/companies')) {
    return mockResponse([])
  }
  // Platforms
  if (url.includes('/api/platforms')) {
    return mockResponse([])
  }
  // Auth (if ever hit in tests)
  if (url.includes('/signin') || url.includes('/signup') || url.includes('/oauth/')) {
    return mockResponse({ accessToken: 'test', refreshToken: 'test' })
  }
  return mockResponse({})
})
