const githubAuthUrl = 'https://github.com/login/oauth/authorize'

const buildGitHubAuthUrl = (clientId: string, origin: string): string => {
  const params = new URLSearchParams({
    client_id: clientId,
    scope: 'read:user user:email',
    redirect_uri: `${origin}/oauth/github/callback`
  })

  return `${githubAuthUrl}?${params.toString()}`
}

const getGitHubAuthErrorMessage = (status?: number, fallback?: string): string => {
  if (status === 403) {
    return 'Your GitHub email is not verified. Verify it on GitHub and try again.'
  }
  if (status === 409) {
    return 'This account cannot use GitHub sign-in. Use password login or resolve the username/email conflict.'
  }
  return fallback || 'GitHub sign-in failed'
}

export { buildGitHubAuthUrl, getGitHubAuthErrorMessage }
