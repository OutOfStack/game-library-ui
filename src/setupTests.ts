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

// Mock environment variables
Object.defineProperty(window, '_env_', {
  value: { GOOGLE_CLIENT_ID: 'test-client-id' }
})
