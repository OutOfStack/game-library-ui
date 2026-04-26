import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Node 24 compatibility: Mock AbortController/AbortSignal for React Router
if (typeof global.AbortController === 'undefined') {
  const MockAbortSignal = class extends EventTarget {
    aborted = false
    onabort: ((this: AbortSignal, ev: Event) => any) | null = null
    reason: any = undefined
    throwIfAborted() {}
    static abort() { return new MockAbortSignal() as AbortSignal }
  }
  
  global.AbortController = class {
    signal = new MockAbortSignal() as AbortSignal
    abort() {}
  } as any
  
  global.AbortSignal = MockAbortSignal as any
}

// Mock matchMedia for MUI
Object.defineProperty(window, 'matchMedia', {
  value: () => ({
    matches: false,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  })
})

// Mock localStorage for Node 25 compatibility
class LocalStorageMock implements Storage {
  private store: Record<string, string> = {}

  clear() {
    this.store = {}
  }

  getItem(key: string) {
    return this.store[key] || null
  }

  setItem(key: string, value: string) {
    this.store[key] = String(value)
  }

  removeItem(key: string) {
    delete this.store[key]
  }

  get length() {
    return Object.keys(this.store).length
  }

  key(index: number) {
    const keys = Object.keys(this.store)
    return keys[index] || null
  }
}

const localStorageMock = new LocalStorageMock()
global.localStorage = localStorageMock

// Also set it on window for jsdom StorageEvent compatibility
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
})

// Mock environment variables
Object.defineProperty(window, '_env_', {
  value: {
    GOOGLE_CLIENT_ID: 'test-client-id',
    GITHUB_CLIENT_ID: 'test-client-id',
    EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS: '120',
    GAMES_URL: 'http://localhost:8000',
    AUTH_URL: 'http://localhost:8001'
  }
})
