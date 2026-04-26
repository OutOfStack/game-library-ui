import { Box, Button } from '@mui/material'
import GitHubIcon from '@mui/icons-material/GitHub'

import { buildGitHubAuthUrl } from '../utils/githubAuth'

interface GitHubSignInButtonProps {
  width: number
}

const GitHubSignInButton = (props: GitHubSignInButtonProps) => {
  const { width } = props

  const handleClick = () => {
    const authUrl = buildGitHubAuthUrl(window._env_.GITHUB_CLIENT_ID, window.location.origin)
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
