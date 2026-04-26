import { useEffect, useRef, useState } from 'react'
import { Alert, Box, CircularProgress, Typography } from '@mui/material'
import { useNavigate, useSearchParams } from 'react-router'

import useAuth from '../hooks/useAuth'
import { IToken } from '../types/Auth/Claims'
import { IValidationResponse } from '../types/Validation'
import { getGitHubAuthErrorMessage, githubAuthStateKey } from '../utils/githubAuth'

const GitHubCallbackPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { signInWithGitHub, setUserTokenStorage } = useAuth()
  const calledRef = useRef(false)
  const [errorText, setErrorText] = useState('')

  useEffect(() => {
    if (calledRef.current) {
      return
    }

    // CSRF protection: the state we sent in the authorize redirect must come back unchanged
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const storedState = sessionStorage.getItem(githubAuthStateKey)
    sessionStorage.removeItem(githubAuthStateKey)

    if (!code) {
      setErrorText('Missing GitHub authorization code.')
      return
    }
    if (!state || !storedState || state !== storedState) {
      setErrorText('Invalid GitHub authorization state.')
      return
    }

    calledRef.current = true

    const exchangeCode = async () => {
      const [resp, err] = await signInWithGitHub(code)
      if (err) {
        const error = err as IValidationResponse
        const message = typeof err === 'string'
          ? getGitHubAuthErrorMessage(undefined, err)
          : getGitHubAuthErrorMessage(error.status, error.error)
        setErrorText(message)
        return
      }

      const token = resp as IToken
      setUserTokenStorage(token)
      navigate('/', { replace: true })
    }

    void exchangeCode()
  }, [navigate, searchParams, setUserTokenStorage, signInWithGitHub])

  if (errorText) {
    return (
      <Box sx={{ maxWidth: 480, mx: 'auto', mt: 8, px: 2 }}>
        <Alert severity="error">{errorText}</Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8, gap: 2 }}>
      <CircularProgress />
      <Typography>Signing in with GitHub...</Typography>
    </Box>
  )
}

export default GitHubCallbackPage
