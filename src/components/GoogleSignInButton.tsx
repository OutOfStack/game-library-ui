import { Box } from '@mui/material'
import { CredentialResponse, GoogleLogin } from '@react-oauth/google'


interface GoogleSignInButtonProps {
  onSuccess: (idToken: string) => void
  onError: (error: string) => void
  width: number
}

const GoogleSignInButton = (props: GoogleSignInButtonProps) => {
  const { onSuccess, onError, width } = props

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
      <GoogleLogin
        onSuccess={( credentialResponse: CredentialResponse ) => {
          if (credentialResponse.credential) {
            onSuccess(credentialResponse.credential)
          } else {
            onError('Failed to get credential from Google')
          }
        }}
        onError={() => {
          onError('Google Sign-In failed')
        }}
        width={width}
        size="large"
        theme="outline"
      />
    </Box>
  )
}

export default GoogleSignInButton