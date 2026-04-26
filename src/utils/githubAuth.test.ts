import { describe, expect, test } from 'vitest'

import { buildGitHubAuthUrl, getGitHubAuthErrorMessage } from './githubAuth'

describe('githubAuth utils', () => {
  test('builds the GitHub authorization url with scopes, callback, and state', () => {
    const url = buildGitHubAuthUrl('client-id', 'http://localhost:3000', 'random-state')

    expect(url).toBe(
      'https://github.com/login/oauth/authorize?client_id=client-id&scope=read%3Auser+user%3Aemail&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Foauth%2Fgithub%2Fcallback&state=random-state'
    )
  })

  test('maps GitHub auth errors to user-friendly messages', () => {
    expect(getGitHubAuthErrorMessage(403, 'fallback')).toContain('not verified')
    expect(getGitHubAuthErrorMessage(409, 'fallback')).toContain('cannot use GitHub sign-in')
    expect(getGitHubAuthErrorMessage(500, 'fallback')).toBe('fallback')
  })
})
