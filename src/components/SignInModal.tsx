import { useState } from 'react'
import { Grid, TextField, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'

import Modal from './Modal'
import GoogleSignInButton from './GoogleSignInButton'
import { ISignIn } from '../types/Auth/SignIn'
import { IToken } from '../types/Auth/Claims'
import { IValidationResponse } from '../types/Validation'
import useAuth from '../hooks/useAuth'

export interface ISignInModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (token: IToken) => void
}

interface IValidation {
  username: string
  password: string
  [index: string]: string
}

const SignInModal = (props: ISignInModalProps) => {
  const { isOpen, onClose, onSuccess } = props

  const { signIn, signInWithGoogle } = useAuth()
  const theme = useTheme()
  const matchesMd = useMediaQuery(theme.breakpoints.up('md'))

  const [signInData, setSignInData] = useState<ISignIn>({} as ISignIn)
  const [dialogText, setDialogText] = useState("")
  const [errorText, setErrorText] = useState("")
  const [validation, setValidation] = useState<IValidation>({
    username: "",
    password: ""
  })

  const validateForm = (): boolean => {
    let valid = true
    if (!signInData.username) {
      setValidation(v => ({ ...v, username: 'field is required' }))
      valid = false
    }
    if (!signInData.password) {
      setValidation(v => ({ ...v, password: 'field is required' }))
      valid = false
    }
    return valid
  }

  const logIn = async (data: ISignIn): Promise<IToken | string> => {
    const [resp, err] = await signIn(data)
    if (err) {
      if (typeof err === 'string') {
        return err
      }
      const error = err as IValidationResponse
      return (
        error.fields?.map((f) => `${f.field}: ${f.error}`).join("; ") ||
        error.error
      )
    }
    const token = resp as IToken
    return token
  }

  const handleLogin = async () => {
    setErrorText("")
    if (!validateForm()) {
      return
    }
    const response = await logIn(signInData)
    if (typeof response === 'string') {
      setErrorText(response)
      return
    }
    const token = response as IToken
    setDialogText("You have successfully logged in")
    setTimeout(() => {
      onSuccess(token)
      onClose()
      resetForm()
    }, 500)
  }

  const handleGoogleSignIn = async (idToken: string) => {
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
    setDialogText("You have successfully logged in with Google")
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
    setSignInData(s => ({ ...s, [field]: value }))
    if (validation[field]?.length > 0 && value?.length > 0) {
      setValidation(v => ({ ...v, [field]: '' }))
    }
  }

  const resetForm = () => {
    setSignInData({} as ISignIn)
    setDialogText("")
    setErrorText("")
    setValidation({
      username: "",
      password: ""
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
      title='Login'
      dialogText={dialogText}
      dialogErrorText={errorText}
      submitActionName='Login'
      handleSubmit={handleLogin}
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
            value={signInData?.username || ""}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => handleFieldChange(e, 'username')}
          />
        </Grid>
        <Grid sx={{ minWidth: matchesMd ? '400px' : '210px' }}>
          <TextField
            required
            error={!!validation.password}
            helperText={validation.password}
            fullWidth
            margin="normal"
            label="Password"
            type="password"
            value={signInData?.password || ""}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => handleFieldChange(e, 'password')}
          />
        </Grid>
        <GoogleSignInButton
          onSuccess={handleGoogleSignIn}
          onError={handleGoogleError}
          width={matchesMd ? 250 : 180}
        />
      </>
    </Modal>
  )
}

export default SignInModal
