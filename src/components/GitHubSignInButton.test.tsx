import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import GitHubSignInButton from './GitHubSignInButton'
import { buildGitHubAuthUrl } from '../utils/githubAuth'

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
  })

  afterEach(() => {
    assignMock.mockReset()
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation
    })
  })

  test('redirects to the GitHub oauth authorization url', () => {
    render(<GitHubSignInButton width={240} />)

    fireEvent.click(screen.getByRole('button', { name: /sign in with github/i }))

    expect(assignMock).toHaveBeenCalledWith(buildGitHubAuthUrl('test-client-id', 'http://localhost'))
  })
})
