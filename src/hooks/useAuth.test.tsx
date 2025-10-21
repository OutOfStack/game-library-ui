import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, test, expect, beforeEach, vi } from 'vitest'

// Mock jwt-decode so we can control validity
let decodeImpl: (token: string) => any
vi.mock('jwt-decode', () => ({
  jwtDecode: (token: string) => decodeImpl(token)
}))

import useAuth from './useAuth'

const lsKey = 'gl_user_token'

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear()
    // Default to a valid token far in the future
    decodeImpl = () => ({
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // +1h
      nbf: Math.floor(Date.now() / 1000) - 60,       // active since 1m ago
      user_role: 'user',
      username: 'tester'
    })
  })

  test('is unauthenticated when no token', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.isAuthenticated).toBe(false)
  })

  test('becomes authenticated after setting token without page reload', () => {
    const { result } = renderHook(() => useAuth())

    act(() => {
      result.current.setUserTokenStorage({ accessToken: 'valid-token' })
    })

    expect(result.current.isAuthenticated).toBe(true)
  })

  test('logs out and becomes unauthenticated', () => {
    const { result } = renderHook(() => useAuth())

    act(() => {
      result.current.setUserTokenStorage({ accessToken: 'valid-token' })
    })
    expect(result.current.isAuthenticated).toBe(true)

    act(() => {
      result.current.logout()
    })
    expect(result.current.isAuthenticated).toBe(false)
  })

  test('syncs authentication across tabs via storage event', async () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.isAuthenticated).toBe(false)

    // Simulate another tab setting the token
    const newValue = JSON.stringify({ accessToken: 'valid-token' })
    localStorage.setItem(lsKey, newValue)

    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: lsKey, newValue, oldValue: null }))
    })

    await waitFor(() => expect(result.current.isAuthenticated).toBe(true))

    // Simulate another tab removing the token
    localStorage.removeItem(lsKey)
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: lsKey, newValue: null, oldValue: newValue }))
    })

    await waitFor(() => expect(result.current.isAuthenticated).toBe(false))
  })
})

