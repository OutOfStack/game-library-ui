import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { githubAuthStateKey } from '../utils/githubAuth'

const navigateMock = vi.fn()
const setUserTokenStorageMock = vi.fn()
const signInWithGitHubMock = vi.fn()

let searchParamsString = 'code=github-code&state=valid-state'

vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router')
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useSearchParams: () => [new URLSearchParams(searchParamsString)]
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
    sessionStorage.clear()
    sessionStorage.setItem(githubAuthStateKey, 'valid-state')
    searchParamsString = 'code=github-code&state=valid-state'
  })

  afterEach(() => {
    sessionStorage.clear()
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
    expect(sessionStorage.getItem(githubAuthStateKey)).toBeNull()
  })

  test('shows an error and does not exchange the code when the state does not match', async () => {
    searchParamsString = 'code=github-code&state=tampered-state'

    render(<GitHubCallbackPage />)

    expect(await screen.findByText(/invalid github authorization state/i)).toBeInTheDocument()
    expect(signInWithGitHubMock).not.toHaveBeenCalled()
    expect(sessionStorage.getItem(githubAuthStateKey)).toBeNull()
  })

  test('shows an error when the state is missing from the callback url', async () => {
    searchParamsString = 'code=github-code'

    render(<GitHubCallbackPage />)

    expect(await screen.findByText(/invalid github authorization state/i)).toBeInTheDocument()
    expect(signInWithGitHubMock).not.toHaveBeenCalled()
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
