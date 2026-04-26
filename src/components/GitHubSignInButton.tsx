import { Box, Button } from '@mui/material'
import GitHubIcon from '@mui/icons-material/GitHub'

import { buildGitHubAuthUrl, githubAuthStateKey } from '../utils/githubAuth'

interface GitHubSignInButtonProps {
  width: number
}

const GitHubSignInButton = (props: GitHubSignInButtonProps) => {
  const { width } = props

  const handleClick = () => {
    // CSRF protection: pass a random state to GitHub and stash it locally so the callback
    // page can confirm the redirect was triggered by this browser session
    const state = crypto.randomUUID()
    sessionStorage.setItem(githubAuthStateKey, state)
    const authUrl = buildGitHubAuthUrl(window._env_.GITHUB_CLIENT_ID, window.location.origin, state)
    window.location.assign(authUrl)
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
      <Button
        variant="outlined"
        startIcon={<GitHubIcon />}
        onClick={handleClick}
        sx={{ width }}
      >
        Sign in with GitHub
      </Button>
    </Box>
  )
}

export default GitHubSignInButton
