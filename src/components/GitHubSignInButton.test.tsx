import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import GitHubSignInButton from './GitHubSignInButton'
import { buildGitHubAuthUrl, githubAuthStateKey } from '../utils/githubAuth'

describe('GitHubSignInButton', () => {
  const originalLocation = window.location
  const assignMock = vi.fn()

  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        ...originalLocation,
        assign: assignMock,
        origin: 'http://localhost'
      }
    })
    sessionStorage.clear()
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('00000000-0000-4000-8000-000000000000')
  })

  afterEach(() => {
    assignMock.mockReset()
    sessionStorage.clear()
    vi.restoreAllMocks()
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation
    })
  })

  test('stores a CSRF state and redirects to the GitHub oauth authorization url', () => {
    render(<GitHubSignInButton width={240} />)

    fireEvent.click(screen.getByRole('button', { name: /sign in with github/i }))

    expect(sessionStorage.getItem(githubAuthStateKey)).toBe('00000000-0000-4000-8000-000000000000')
    expect(assignMock).toHaveBeenCalledWith(
      buildGitHubAuthUrl('test-client-id', 'http://localhost', '00000000-0000-4000-8000-000000000000')
    )
  })
})
