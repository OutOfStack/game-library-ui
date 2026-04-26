import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'

// Mock jwt-decode so we can control validity
let decodeImpl: (token: string) => any
vi.mock('jwt-decode', () => ({
  jwtDecode: (token: string) => decodeImpl(token)
}))

import useAuth from './useAuth'

const lsKey = 'gl_user_token'
const originalFetch = global.fetch

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear()
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      headers: new Headers(),
      json: async () => ({ error: 'invalid' })
    } as Response)
    // Default to a valid token far in the future
    decodeImpl = () => ({
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // +1h
      nbf: Math.floor(Date.now() / 1000) - 60,       // active since 1m ago
      user_role: 'user',
      username: 'tester'
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    global.fetch = originalFetch
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

  test('logs out and becomes unauthenticated', async () => {
    const logoutFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      headers: new Headers(),
      json: async () => ({})
    } as Response)
    global.fetch = logoutFetch as any
    const { result } = renderHook(() => useAuth())

    act(() => {
      result.current.setUserTokenStorage({ accessToken: 'valid-token' })
    })
    expect(result.current.isAuthenticated).toBe(true)

    await act(async () => {
      await result.current.logout()
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

  test('refreshes expired token via getAccessToken and updates storage', async () => {
    const originalFetch = global.fetch
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-length': '1' }),
      json: async () => ({ accessToken: 'refreshed-token' })
    } as Response)
    global.fetch = fetchMock as any

    const now = Math.floor(Date.now() / 1000)
    decodeImpl = (token: string) => token === 'expired-token'
      ? { exp: now - 100, nbf: now - 200, user_role: 'user', username: 'tester' }
      : { exp: now + 3600, nbf: now - 60, user_role: 'user', username: 'tester' }

    localStorage.setItem(lsKey, JSON.stringify({ accessToken: 'expired-token' }))

    const { result } = renderHook(() => useAuth())

    expect(fetchMock).not.toHaveBeenCalled()

    let refreshedToken = ''
    await act(async () => {
      refreshedToken = await result.current.getAccessToken()
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(refreshedToken).toBe('refreshed-token')
    expect(JSON.parse(localStorage.getItem(lsKey)!).accessToken).toBe('refreshed-token')

  })

  test('clears storage when refresh fails', async () => {
    const originalFetch = global.fetch
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      headers: new Headers(),
      json: async () => ({ error: 'invalid' })
    } as Response)
    global.fetch = fetchMock as any

    const now = Math.floor(Date.now() / 1000)
    decodeImpl = (token: string) => token === 'expired-token'
      ? { exp: now - 100, nbf: now - 200, user_role: 'user', username: 'tester' }
      : { exp: now + 3600, nbf: now - 60, user_role: 'user', username: 'tester' }

    localStorage.setItem(lsKey, JSON.stringify({ accessToken: 'expired-token' }))

    const { result } = renderHook(() => useAuth())

    expect(fetchMock).not.toHaveBeenCalled()

    let token = 'placeholder'
    await act(async () => {
      token = await result.current.getAccessToken()
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(token).toBe('')
    expect(localStorage.getItem(lsKey)).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)

  })

  test('coalesces concurrent refresh attempts into one network call', async () => {
    const originalFetch = global.fetch
    let resolveJson: (value: any) => void = () => {}
    const jsonPromise = new Promise((resolve) => {
      resolveJson = resolve
    })
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-length': '1' }),
      json: () => jsonPromise
    } as Response)
    global.fetch = fetchMock as any

    const now = Math.floor(Date.now() / 1000)
    decodeImpl = (token: string) => token === 'expired-token'
      ? { exp: now - 100, nbf: now - 200, user_role: 'user', username: 'tester' }
      : { exp: now + 3600, nbf: now - 60, user_role: 'user', username: 'tester' }

    localStorage.setItem(lsKey, JSON.stringify({ accessToken: 'expired-token' }))

    const { result } = renderHook(() => useAuth())

    expect(fetchMock).not.toHaveBeenCalled()

    let tokens: string[] = []
    const combined = act(async () => {
      tokens = await Promise.all([
        result.current.getAccessToken(),
        result.current.getAccessToken()
      ])
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    resolveJson({ accessToken: 'refreshed-token' })
    await combined

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(tokens).toEqual(['refreshed-token', 'refreshed-token'])

  })

  test('signs in with GitHub using the authorization code', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-length': '1' }),
      json: async () => ({ accessToken: 'github-token' })
    } as Response)
    global.fetch = fetchMock as any
    localStorage.setItem(lsKey, JSON.stringify({ accessToken: 'valid-token' }))

    const { result } = renderHook(() => useAuth())

    let response: any
    await act(async () => {
      response = await result.current.signInWithGitHub('github-code')
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8001/oauth/github',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ code: 'github-code' })
      })
    )
    expect(response?.[0]).toEqual({ accessToken: 'github-token' })
    expect(response?.[1]).toBeNull()
  })
})
