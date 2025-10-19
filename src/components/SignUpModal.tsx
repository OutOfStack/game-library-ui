import { useState } from 'react'
import { Alert, Checkbox, FormControlLabel, Grid, Link, TextField, Tooltip, Typography, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'

import Modal from './Modal'
import GoogleSignInButton from './GoogleSignInButton'
import { ISignUp } from '../types/Auth/SignUp'
import { IToken } from '../types/Auth/Claims'
import { IValidationResponse } from '../types/Validation'
import { randomName } from '../utils/randomName'
import useAuth from '../hooks/useAuth'

export interface ISignUpModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (token: IToken) => void
}

interface IValidation {
  username: string
  name: string
  email: string
  password: string
  confirmPassword: string
  terms: string
  [index: string]: string
}

const SignUpModal = (props: ISignUpModalProps) => {
  const { isOpen, onClose, onSuccess } = props

  const { signUp, signInWithGoogle } = useAuth()
  const theme = useTheme()
  const matchesMd = useMediaQuery(theme.breakpoints.up('md'))

  const [signUpData, setSignUpData] = useState<ISignUp>({} as ISignUp)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [dialogText, setDialogText] = useState("")
  const [errorText, setErrorText] = useState("")
  const [validation, setValidation] = useState<IValidation>({
    username: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: ""
  })

  const validateForm = (): boolean => {
    let valid = true
    if (!signUpData.username) {
      setValidation(v => ({ ...v, username: 'field is required' }))
      valid = false
    } else if (signUpData.username.length < 4) {
      setValidation(v => ({ ...v, username: 'minimum length is 4' }))
      valid = false
    } else if (!/^[a-zA-Z0-9_]+$/.test(signUpData.username)) {
      setValidation(v => ({ ...v, username: 'can only contain letters, numbers, and underscores' }))
      valid = false
    }

    if (!signUpData.name) {
      setValidation(v => ({ ...v, name: 'field is required' }))
      valid = false
    } else if (signUpData.name.length < 4) {
      setValidation(v => ({ ...v, name: 'minimum length is 4' }))
      valid = false
    }

    if (signUpData.isPublisher) {
      if (!signUpData.email) {
        setValidation(v => ({ ...v, email: 'email is required for publishers' }))
        valid = false
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signUpData.email)) {
        setValidation(v => ({ ...v, email: 'invalid email format' }))
        valid = false
      }
    }

    if (!signUpData.password) {
      setValidation(v => ({ ...v, password: 'field is required' }))
      valid = false
    } else if (signUpData.password.length < 8) {
      setValidation(v => ({ ...v, password: 'minimum length is 8' }))
      valid = false
    }

    if (!signUpData.confirmPassword) {
      setValidation(v => ({ ...v, confirmPassword: 'field is required' }))
      valid = false
    } else if (signUpData.password !== signUpData.confirmPassword) {
      setValidation(v => ({ ...v, confirmPassword: 'passwords do not match' }))
      valid = false
    }

    if (!termsAccepted) {
      setValidation(v => ({ ...v, terms: 'you must agree to the terms and privacy policy' }))
      valid = false
    }

    return valid
  }

  const handleRegister = async () => {
    setErrorText("")
    if (!validateForm()) {
      return
    }
    const [resp, err] = await signUp(signUpData)
    if (err) {
      if (typeof err === 'string') {
        setErrorText(err)
        return
      }
      const error = err as IValidationResponse
      setErrorText(error.fields?.map(f => `${f.field}: ${f.error}`).join("; ") || error.error)
      return
    }
    const token = resp as IToken
    setDialogText("You have successfully registered")
    setTimeout(() => {
      onSuccess(token)
      onClose()
      resetForm()
    }, 500)
  }

  const handleGoogleSignUp = async (idToken: string) => {
    setErrorText("")
    const [resp, err] = await signInWithGoogle(idToken)
    if (err) {
      if (typeof err === 'string') {
        setErrorText(err)
        return
      }
      const error = err as IValidationResponse
      setErrorText(error.fields?.map(f => `${f.field}: ${f.error}`).join("; ") || error.error)
      return
    }
    const token = resp as IToken
    setDialogText("You have successfully registered with Google")
    setTimeout(() => {
      onSuccess(token)
      onClose()
      resetForm()
    }, 500)
  }

  const handleGoogleError = (error: string) => {
    setErrorText(error)
  }

  const handleFieldChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, field: string) => {
    const value = e.target.value?.trimStart()
    setSignUpData(s => ({ ...s, [field]: value }))
    if (validation[field]?.length > 0 && value?.length > 0) {
      setValidation(v => ({ ...v, [field]: '' }))
    }
  }

  const resetForm = () => {
    setSignUpData({} as ISignUp)
    setTermsAccepted(false)
    setDialogText("")
    setErrorText("")
    setValidation({
      username: "",
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: ""
    })
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Modal
      matchesMd={matchesMd}
      isOpen={isOpen}
      closeDialog={handleClose}
      title='Register'
      dialogText={dialogText}
      dialogErrorText={errorText}
      submitActionName='Register'
      submitDisabled={!termsAccepted}
      handleSubmit={handleRegister}
    >
      <>
        <Grid sx={{ minWidth: matchesMd ? '400px' : '210px' }}>
          <TextField
            required
            error={!!validation.username}
            helperText={validation.username}
            fullWidth
            label="Username"
            margin="normal"
            name="username"
            value={signUpData?.username || ""}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => handleFieldChange(e, 'username')}
          />
        </Grid>
        <Grid sx={{ minWidth: matchesMd ? '400px' : '210px' }}>
          <TextField
            required
            error={!!validation.name}
            helperText={validation.name}
            fullWidth
            label="Display name"
            placeholder={randomName()}
            margin="normal"
            name="name"
            value={signUpData?.name || ""}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => handleFieldChange(e, 'name')}
          />
        </Grid>
        <Grid sx={{ minWidth: matchesMd ? '400px' : '210px' }}>
          <Tooltip
            title="Contributors can add games to the library but cannot rate games. Email verification required. Note: Google Sign-In is not available for contributors."
            placement={matchesMd ? "right" : "top"}
            enterTouchDelay={0}
            leaveTouchDelay={3000}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={signUpData.isPublisher || false}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => (setSignUpData(d => ({ ...d, isPublisher: e.target.checked })))}
                />}
              label="I want to contribute games"
            />
          </Tooltip>
        </Grid>
        {signUpData.isPublisher && (
          <Grid sx={{ minWidth: matchesMd ? '400px' : '210px' }}>
            <TextField
              required
              error={!!validation.email}
              helperText={validation.email}
              fullWidth
              label="Email"
              type="email"
              margin="normal"
              name="email"
              value={signUpData?.email || ""}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => handleFieldChange(e, 'email')}
            />
          </Grid>
        )}
        <Grid sx={{ minWidth: matchesMd ? '400px' : '210px' }}>
          <TextField
            required
            error={!!validation.password}
            helperText={validation.password}
            fullWidth
            margin="normal"
            label="Password"
            type="password"
            name="password"
            autoComplete="new-password"
            value={signUpData?.password || ""}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => handleFieldChange(e, 'password')}
          />
        </Grid>
        <Grid sx={{ minWidth: matchesMd ? '400px' : '210px' }}>
          <TextField
            required
            error={!!validation.confirmPassword}
            helperText={validation.confirmPassword}
            fullWidth
            margin="normal"
            label="Confirm password"
            type="password"
            name="confirm-password"
            value={signUpData?.confirmPassword || ""}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => handleFieldChange(e, 'confirmPassword')}
          />
        </Grid>
        <Grid sx={{ minWidth: matchesMd ? '400px' : '210px' }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={termsAccepted}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setTermsAccepted(e.target.checked)
                  if (validation.terms && e.target.checked) {
                    setValidation(v => ({ ...v, terms: '' }))
                  }
                }}
              />}
            label={
              <Typography variant="body2">
                I agree to the{' '}
                <Link href="/privacy-policy.html" target="_blank" rel="noopener">
                  Privacy Policy
                </Link>
                {' '}and{' '}
                <Link href="/terms-of-service.html" target="_blank" rel="noopener">
                  Terms of Service
                </Link>
              </Typography>
            }
          />
          {validation.terms && (
            <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
              {validation.terms}
            </Typography>
          )}
        </Grid>
        {!signUpData.isPublisher && (
          <GoogleSignInButton
            onSuccess={handleGoogleSignUp}
            onError={handleGoogleError}
            width={matchesMd ? 250 : 180}
          />
        )}
      </>
    </Modal>
  )
}

export default SignUpModal
