import { useEffect, useRef, useState } from 'react'
import { Alert, Box, CircularProgress, Typography } from '@mui/material'
import { useNavigate, useSearchParams } from 'react-router'

import useAuth from '../hooks/useAuth'
import { IToken } from '../types/Auth/Claims'
import { IValidationResponse } from '../types/Validation'
import { getGitHubAuthErrorMessage } from '../utils/githubAuth'

const GitHubCallbackPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { signInWithGitHub, setUserTokenStorage } = useAuth()
  const calledRef = useRef(false)
  const [errorText, setErrorText] = useState('')

  useEffect(() => {
    const code = searchParams.get('code')
    if (!code || calledRef.current) {
      if (!code) {
        setErrorText('Missing GitHub authorization code.')
      }
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
