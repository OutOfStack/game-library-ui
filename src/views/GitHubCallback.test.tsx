import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

const navigateMock = vi.fn()
const setUserTokenStorageMock = vi.fn()
const signInWithGitHubMock = vi.fn()

vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router')
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useSearchParams: () => [new URLSearchParams('code=github-code')]
  }
})

vi.mock('../hooks/useAuth', () => ({
  default: () => ({
    signInWithGitHub: signInWithGitHubMock,
    setUserTokenStorage: setUserTokenStorageMock
  })
}))

import GitHubCallbackPage from './GitHubCallback'

describe('GitHubCallbackPage', () => {
  beforeEach(() => {
    navigateMock.mockReset()
    setUserTokenStorageMock.mockReset()
    signInWithGitHubMock.mockReset()
  })

  test('exchanges the code, stores the token, and redirects home', async () => {
    signInWithGitHubMock.mockResolvedValue([
      { accessToken: 'github-token' },
      null
    ])

    render(<GitHubCallbackPage />)

    await waitFor(() => {
      expect(signInWithGitHubMock).toHaveBeenCalledWith('github-code')
      expect(setUserTokenStorageMock).toHaveBeenCalledWith({ accessToken: 'github-token' })
      expect(navigateMock).toHaveBeenCalledWith('/', { replace: true })
    })
  })

  test('shows a helpful error when github email is not verified', async () => {
    signInWithGitHubMock.mockResolvedValue([
      null,
      { error: 'email not verified', status: 403 }
    ])

    render(<GitHubCallbackPage />)

    expect(await screen.findByText(/github email is not verified/i)).toBeInTheDocument()
  })

  test('shows a helpful error when the backend reports an account conflict', async () => {
    signInWithGitHubMock.mockResolvedValue([
      null,
      { error: 'account conflict', status: 409 }
    ])

    render(<GitHubCallbackPage />)

    expect(await screen.findByText(/cannot use github sign-in/i)).toBeInTheDocument()
  })
})
