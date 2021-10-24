import { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Alert, AlertColor, AppBar, Box, Button, ButtonGroup, Checkbox, Dialog, DialogTitle, DialogContent, 
  DialogActions, FormControlLabel, Grid, Snackbar, TextField, Toolbar, Typography, useMediaQuery } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { useTheme } from '@mui/material/styles'
import { makeStyles } from '@mui/styles'

import { Search, SearchIconWrapper, StyledInputBase } from './SearchField'
import { ISignIn, IToken } from '../types/Auth/SignIn'
import useAuth from '../hooks/useAuth'
import { ISignUp } from '../types/Auth/SignUp'
import { IGetUser } from '../types/Auth/User'
import { IValidationResponse } from '../types/Validation'


const useStyles = makeStyles(() => ({
  title: {
    cursor: 'pointer'
  }
}))

export interface ISearchFieldProps {
  text: string,
  changeText: (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void
}

export interface IHeaderProps {
  searchFieldProps: ISearchFieldProps
}

interface IValidation {
  username: string,
  password: string,
  [index: string]: string
}

const Header = (props: IHeaderProps) => {

  const { searchFieldProps } = props

  const { signIn, signUp } = useAuth()
  const classes = useStyles()
  const history = useHistory()
  const theme = useTheme()
  const matchesMd = useMediaQuery(theme.breakpoints.up('md'))

  //#region notification

  const defaultAlert = {
    open: false,
    message: "",
    severity: "success" as AlertColor
  }
  const [alert, setAlert] = useState(defaultAlert)

  const handleCloseAlert = (event?: React.SyntheticEvent, reason?: string) => {
    if (reason === 'clickaway') {
      return
    }
    setAlert(a => ({...defaultAlert, severity: a.severity}))
  }

  const showNotification = (message: string, severity: AlertColor = "success") => {
    setAlert({
      message: message,
      severity: severity,
      open: true
    })
  }

  //#endregion

  //#region sign up
  
  const [signUpData, setSignUpData] = useState<ISignUp>({} as ISignUp)
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false)
  const [registerDialogText, setRegisterDialogText] = useState("")
  const [registerErrorText, setRegisterErrorText] = useState("")
  const [registerValidation, setRegisterValidation] = useState<IValidation>({
    username: "",
    name: "",
    password: "",
    confirmPassword: ""
  })

  const handleRegisterDialogOpen = () => setRegisterDialogOpen(true)
  const handleRegisterDialogClose = () => setRegisterDialogOpen(false)
  
  const validateRegisterForm = (): boolean => {
    let valid = true
    if (!signUpData.username) {
      setRegisterValidation(v => ({...v, username: 'field is required'}))
      valid = false
    }

    if (!signUpData.name) {
      setRegisterValidation(v => ({...v, name: 'field is required'}))
      valid = false
    }

    if (!signUpData.password) {
      setRegisterValidation(v => ({...v, password: 'field is required'}))
      valid = false
    } else if (signUpData.password.length < 8) {
      setRegisterValidation(v => ({...v, password: 'minimum length is 8'}))
      valid = false
    }

    if (!signUpData.confirmPassword) {
      setRegisterValidation(v => ({...v, confirmPassword: 'field is required'}))
      valid = false
    } else if (signUpData.password !== signUpData.confirmPassword) {
      setRegisterValidation(v => ({...v, confirmPassword: 'passwords do not match'}))
      valid = false
    }

    return valid
  }

  const handleRegister = async () => {
    setRegisterErrorText("")
    if (!validateRegisterForm()) {
      return
    }
    const [resp, err] = await signUp(signUpData)
    if (err) {
      const error = resp as IValidationResponse
      setRegisterErrorText(error.fields?.map(f => `${f.field}: ${f.error}`).join("; ") || error.error)
      return
    }
    const user = resp as IGetUser
    console.log(user)
    // automatically log in after registration
    if (user.id) {
      setRegisterDialogText("You have successfully registered")
      const signIn: ISignIn = {
        username: signUpData.username,
        password: signUpData.password
      }
      const response = await Login(signIn)
      if (typeof response === 'string') {
        setRegisterErrorText(response)
        return
      }
      console.log(response)
      const token = response as IToken
      setToken(token.accessToken)
    }
    
    setRegisterDialogText("You have successfully logged in")
    setTimeout(() => {
      handleRegisterDialogClose()
    }, 500)
  }

  //#endregion

  //#region sign in

  const [signInData, setSignInData] = useState<ISignIn>({} as ISignIn)
  const [token, setToken] = useState("")
  const [loginDialogOpen, setLoginDialogOpen] = useState(false)
  const [loginDialogText, setLoginDialogText] = useState("")
  const [loginErrorText, setLoginErrorText] = useState("")
  const [loginValidation, setLoginValidation] = useState<IValidation>({
    username: "",
    password: ""
  })

  const handleLoginDialogOpen = () => setLoginDialogOpen(true)
  const handleLoginDialogClose = () => setLoginDialogOpen(false)
  
  const validateLoginForm = (): boolean => {
    let valid = true
    if (!signInData.username) {
      setLoginValidation(v => ({...v, username: 'field is required'}))
      valid = false
    }
    if (!signInData.password) {
      setLoginValidation(v => ({...v, password: 'field is required'}))
      valid = false
    }
    return valid
  }

  // Login call to server
  const Login = async (data: ISignIn): Promise<IToken | IValidationResponse> => {
    const [resp, err] = await signIn(data)
    if (err) {
      const error = resp as IValidationResponse
      return error
    }
    const token = resp as IToken
    return token
  }

  // login handler
  const handleLogin = async () => {
    setLoginErrorText("")
    if (!validateLoginForm()) {
      return
    }
    const response = await Login(signInData)
    if (typeof response === 'string') {
      setLoginErrorText(response)
      return
    } else {

    }
    console.log(response)
    const token = response as IToken
    setToken(token.accessToken)
    setLoginDialogText("You have successfully logged in")
    setTimeout(() => {
      handleLoginDialogClose()
    }, 500)
  }

  //#endregion


  const handleFieldChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, field: string, isLogin = true) => {
    if (isLogin) {
      setSignInData(s => ({...s, [field]: e.target.value}))
      // remove error if there is a value now
      if (loginValidation[field]?.length > 0 && e.target.value?.length > 0) {
        setLoginValidation(v => ({...v, [field]: ''}))
      }
    } else {
      setSignUpData(s => ({...s, [field]: e.target.value}))
      // remove error if there is a value now
      if (registerValidation[field]?.length > 0 && e.target.value?.length > 0) {
        setRegisterValidation(v => ({...v, [field]: ''}))
      }
    }
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Snackbar 
        anchorOrigin={{ vertical: 'top', horizontal: 'right'}} 
        open={alert.open}
        autoHideDuration={5000}
        onClose={handleCloseAlert}
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }} >
          {alert.message}
        </Alert>
      </Snackbar>
      <AppBar position="static" >
        <Toolbar>
          <Typography variant="h5" sx={matchesMd ? {  mr: 2, ml: '5vw' } : {}}>
            <span
              onClick={() => { history.push("/"); history.go(0); }}
              className={classes.title}
            >
              Game Library
            </span>
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          <Search sx={{ ml: 2 }}>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Enter game name"
              value={searchFieldProps.text}
              onChange={searchFieldProps.changeText}
            />
          </Search>

          {token 
            ? <Typography sx={matchesMd ? { mr: '5vw', ml: 2 } : {}}>Good day!</Typography>
            : <ButtonGroup variant="text" size={matchesMd ? "large" : "small"} sx={matchesMd ? { mr: '5vw', ml: 2 } : {}}>
              <Button color="inherit" onClick={() => handleRegisterDialogOpen()}>Register</Button>
              <Button color="inherit" onClick={() => handleLoginDialogOpen()}>Login</Button>
            </ButtonGroup>
          }

          <Dialog open={registerDialogOpen} onClose={handleRegisterDialogClose} fullWidth={matchesMd}>
            <DialogTitle sx={{textAlign: 'center'}}>Register</DialogTitle>
              <DialogContent>
                {registerDialogText || 
                  <Grid container direction="column" alignItems="center">
                    <Grid item sx={{ minWidth: matchesMd ? '400px' : '210px' }}>
                      <TextField
                        required
                        error={!!registerValidation.username}
                        helperText={registerValidation.username}
                        fullWidth
                        label="Username"
                        margin="normal"
                        value={signUpData?.username || ""}
                        onChange={(e) => handleFieldChange(e, 'username', false)}
                      />
                    </Grid>
                    <Grid item sx={{ minWidth: matchesMd ? '400px' : '210px' }}>
                      <TextField
                        required
                        error={!!registerValidation.name}
                        helperText={registerValidation.name}
                        fullWidth
                        label="Name"
                        margin="normal"
                        value={signUpData?.name || ""}
                        onChange={(e) => handleFieldChange(e, 'name', false)}
                      />
                    </Grid>
                    <Grid item sx={{ minWidth: matchesMd ? '400px' : '210px' }}>
                      <TextField
                        required
                        error={!!registerValidation.password}
                        helperText={registerValidation.password}
                        fullWidth
                        margin="normal"
                        label="Password"
                        type="password"
                        value={signUpData?.password || ""}
                        onChange={(e) => handleFieldChange(e, 'password', false)}
                      />
                    </Grid>
                    <Grid item sx={{ minWidth: matchesMd ? '400px' : '210px' }}>
                      <TextField
                        required
                        error={!!registerValidation.confirmPassword}
                        helperText={registerValidation.confirmPassword}
                        fullWidth
                        margin="normal"
                        label="Confirm password"
                        type="password"
                        value={signUpData?.confirmPassword || ""}
                        onChange={(e) => handleFieldChange(e, 'confirmPassword', false)}
                      />
                    </Grid>
                    <Grid item sx={{ minWidth: matchesMd ? '400px' : '210px' }}>
                      <FormControlLabel
                        control={
                          <Checkbox 
                            checked={signUpData.isPublisher || false} 
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => (setSignUpData(d => ({...d, isPublisher: e.target.checked})))}
                          />}
                        label="Is publisher" 
                      />
                    </Grid>
                    {registerErrorText && 
                      <Grid item sx={{ minWidth: matchesMd ? '400px' : '210px' }}>
                        <Typography>
                          {registerErrorText}
                        </Typography>
                      </Grid>
                    }
                  </Grid>
                }
              </DialogContent>
              <DialogActions>
                <Button size="large" variant="contained" onClick={handleRegisterDialogClose}>Cancel</Button>
                <Button size="large" variant="contained" color="success" onClick={handleRegister}>Register</Button>
            </DialogActions>
          </Dialog>

          <Dialog open={loginDialogOpen} onClose={handleLoginDialogClose} fullWidth={matchesMd}>
            <DialogTitle sx={{textAlign: 'center'}}>Login</DialogTitle>
              <DialogContent>
                {loginDialogText || 
                  <Grid container direction="column" alignItems="center">
                    <Grid item sx={{ minWidth: matchesMd ? '400px' : '210px' }}>
                      <TextField
                        required
                        error={!!loginValidation.username}
                        helperText={loginValidation.username}
                        fullWidth
                        label="Username"
                        margin="normal"
                        value={signInData?.username || ""}
                        onChange={(e) => handleFieldChange(e, 'username')}
                      />
                    </Grid>
                    <Grid item sx={{ minWidth: matchesMd ? '400px' : '210px' }}>
                      <TextField
                        required
                        error={!!loginValidation.password}
                        helperText={loginValidation.password}
                        fullWidth
                        margin="normal"
                        label="Password"
                        type="password"
                        value={signInData?.password || ""}
                        onChange={(e) => handleFieldChange(e, 'password')}
                      />
                    </Grid>
                    {loginErrorText && 
                      <Grid item sx={{ minWidth: matchesMd ? '400px' : '210px' }}>
                        <Typography>
                          {loginErrorText}
                        </Typography>
                      </Grid>
                    }
                  </Grid>
                }
              </DialogContent>
              <DialogActions>
                <Button size="large" variant="contained" onClick={handleLoginDialogClose}>Cancel</Button>
                <Button size="large" variant="contained" color="success" onClick={handleLogin}>Login</Button>
            </DialogActions>
          </Dialog>
        </Toolbar>
      </AppBar>
    </Box>
  )
}

export default Header