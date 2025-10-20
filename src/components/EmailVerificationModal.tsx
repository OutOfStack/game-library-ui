import { useState, useRef, useEffect, ClipboardEvent, KeyboardEvent, ChangeEvent } from 'react'
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField, Typography, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { IValidationResponse } from '../types/Validation'

export interface IEmailVerificationModalProps {
  isOpen: boolean,
  closeDialog: () => void,
  handleSubmit: (code: string) => Promise<void>,
  handleResend: () => Promise<void>
}

const EmailVerificationModal = (props: IEmailVerificationModalProps) => {
  const { isOpen, closeDialog, handleSubmit, handleResend } = props

  const theme = useTheme()
  const matchesMd = useMediaQuery(theme.breakpoints.up('md'))

  const [code, setCode] = useState<string[]>(['', '', '', '', '', ''])
  const [errorText, setErrorText] = useState('')
  const [successText, setSuccessText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const cooldownSeconds = parseInt(window._env_?.EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS || '120')

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  useEffect(() => {
    if (isOpen && inputRefs.current[0]) {
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
    }
  }, [isOpen])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value.slice(-1)
    setCode(newCode)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    setErrorText('')
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newCode = [...code]

    for (let i = 0; i < 6; i++) {
      newCode[i] = pastedData[i] || ''
    }

    setCode(newCode)
    setErrorText('')

    const nextEmptyIndex = newCode.findIndex(c => !c)
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus()
    } else {
      inputRefs.current[5]?.focus()
    }
  }

  const handleVerify = async () => {
    const verificationCode = code.join('')
    if (verificationCode.length !== 6) {
      setErrorText('Please enter all 6 digits')
      return
    }

    setIsSubmitting(true)
    setErrorText('')
    setSuccessText('')

    try {
      await handleSubmit(verificationCode)
      setSuccessText('Email verified successfully!')
      setTimeout(() => {
        closeDialog()
        resetForm()
      }, 1000)
    } catch (error) {
      setErrorText(typeof error === 'string' ? error : 'Verification failed. Please check the code and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendClick = async () => {
    if (resendCooldown > 0) return

    setErrorText('')
    setSuccessText('')

    try {
      await handleResend()
      setResendCooldown(cooldownSeconds)
      setSuccessText('Verification code sent to your email')
    } catch (error) {
      let errorMessage = 'Failed to resend code. Please try again.'
      let cooldownFromHeader: number | null = null

      if (typeof error === 'object' && error !== null) {
        const validationError = error as IValidationResponse
        errorMessage = validationError.error || errorMessage

        // Read Retry-After header if present (for 429 responses)
        const retryAfter = validationError.headers?.get('Retry-After')
        if (retryAfter) {
          const parsedCooldown = parseInt(retryAfter, 10)
          if (!isNaN(parsedCooldown) && parsedCooldown > 0) {
            cooldownFromHeader = parsedCooldown
          }
        }
      } else if (typeof error === 'string') {
        errorMessage = error
      }

      // Set cooldown from header if available
      if (cooldownFromHeader) {
        setResendCooldown(cooldownFromHeader)
      }

      setErrorText(errorMessage)
    }
  }

  const resetForm = () => {
    setCode(['', '', '', '', '', ''])
    setErrorText('')
    setSuccessText('')
    setResendCooldown(0)
  }

  const handleClose = () => {
    resetForm()
    closeDialog()
  }

  return (
    <Dialog open={isOpen} onClose={handleClose} disableEscapeKeyDown>
      <DialogTitle sx={{ textAlign: 'center' }}>Verify Your Email</DialogTitle>
      <DialogContent>
        <Grid container direction="column" sx={{ alignItems: 'center' }}>
          <Typography variant="body2" sx={{ mb: 3, textAlign: 'center', maxWidth: matchesMd ? '400px' : '280px' }}>
            Enter the 6-digit verification code sent to your email address
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            {code.map((digit, index) => (
              <TextField
                key={index}
                inputRef={(el) => (inputRefs.current[index] = el)}
                value={digit}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(index, e.target.value)}
                onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                slotProps={{
                  htmlInput: {
                    maxLength: 1,
                    style: {
                      textAlign: 'center',
                      fontSize: '1.5rem',
                      padding: matchesMd ? '12px' : '8px',
                      width: matchesMd ? '40px' : '30px'
                    }
                  }
                }}
                sx={{
                  width: matchesMd ? '64px' : '46px'
                }}
              />
            ))}
          </Box>

          {errorText && (
            <Grid sx={{ minWidth: matchesMd ? '400px' : '280px', mb: 2 }}>
              <Alert severity="error" icon={false}>
                <Typography variant="body2">
                  {errorText}
                </Typography>
              </Alert>
            </Grid>
          )}

          {successText && (
            <Grid sx={{ minWidth: matchesMd ? '400px' : '280px', mb: 2 }}>
              <Alert severity="success" icon={false}>
                <Typography variant="body2">
                  {successText}
                </Typography>
              </Alert>
            </Grid>
          )}

          <Button
            variant="text"
            onClick={handleResendClick}
            disabled={resendCooldown > 0}
            sx={{ mt: 1 }}
          >
            {resendCooldown > 0
              ? `Resend code in ${resendCooldown}s`
              : 'Resend code'}
          </Button>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          size="large"
          variant="contained"
          onClick={handleClose}
        >
          Cancel
        </Button>
        <Button
          size="large"
          variant="contained"
          color="success"
          onClick={handleVerify}
          disabled={isSubmitting || code.join('').length !== 6}
        >
          Verify
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default EmailVerificationModal
