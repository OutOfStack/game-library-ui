import { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Alert, AlertColor, AppBar, Avatar, Box, Button, ButtonGroup, Checkbox, FormControlLabel, Grid, 
  Snackbar, TextField, Toolbar, Tooltip, Typography, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { makeStyles } from 'tss-react/mui'
import LoginIcon from '@mui/icons-material/LoginRounded'
import LogoutIcon from '@mui/icons-material/LogoutRounded'
import HowToRegIcon from '@mui/icons-material/HowToRegRounded'
import DarkModeIcon from '@mui/icons-material/DarkModeRounded'
import LightModeIcon from '@mui/icons-material/LightModeRounded'
import SearchIcon from '@mui/icons-material/SearchRounded'

import { Search, SearchIconWrapper, StyledInputBase } from './SearchField'
import { ISignIn, IToken } from '../types/Auth/SignIn'
import useAuth from '../hooks/useAuth'
import { ISignUp } from '../types/Auth/SignUp'
import { IGetUser } from '../types/Auth/User'
import { IValidationResponse } from '../types/Validation'
import { stringAvatar } from '../utils/avatar'
import Modal from '../components/Modal'


const useStyles = makeStyles()(() => ({
  title: {
    cursor: 'pointer'
  }
}))

export interface ISearchFieldProps {
  text: string,
  changeText: (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void
}

export interface IDarkModeProps {
  darkMode: boolean,
  changeMode: () => void
}

export interface IHeaderProps {
  searchFieldProps: ISearchFieldProps,
  darkModeProps: IDarkModeProps
}

interface IValidation {
  username: string,
  password: string,
  [index: string]: string
}

const Header = (props: IHeaderProps) => {

  const { searchFieldProps, darkModeProps } = props

  const { signIn, signUp, getClaims, isAuthenticated, setUserStorage, logout } = useAuth()
  const { classes } = useStyles()
  const history = useHistory()
  const theme = useTheme()
  const matchesMd = useMediaQuery(theme.breakpoints.up('md'))
  const matchesSm = useMediaQuery(theme.breakpoints.only('sm'))
  const matchesXs = useMediaQuery(theme.breakpoints.only('xs'))

  const { name, username } = getClaims()

  //#region notification

  const defaultAlert = {
    open: false,
    message: "",
    severity: "success" as AlertColor
  }
  const [alert, setAlert] = useState(defaultAlert)

  const handleCloseAlert = (event: Event | React.SyntheticEvent<any, Event>, reason?: string) => {
    if (reason === 'clickaway') {
      return
    }
    setAlert(a => ({...defaultAlert, severity: a.severity}))
  }

  /*const showNotification = (message: string, severity: AlertColor = "success") => {
    setAlert({
      message: message,
      severity: severity,
      open: true
    })
  }*/

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
      if (typeof err === 'string') {
        setRegisterErrorText(err)
        return
      }
      const error = err as IValidationResponse
      setRegisterErrorText(error.fields?.map(f => `${f.field}: ${f.error}`).join("; ") || error.error)
      return
    }
    const user = resp as IGetUser
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
      const token = response as IToken
      setUserStorage(token)
    }
    
    setRegisterDialogText("You have successfully logged in")
    setTimeout(() => {
      handleRegisterDialogClose()
    }, 500)
  }

  //#endregion

  //#region sign in

  const [signInData, setSignInData] = useState<ISignIn>({} as ISignIn)
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
  const Login = async (data: ISignIn): Promise<IToken | string> => {
    const [resp, err] = await signIn(data)
    if (err) {
      if (typeof err === 'string') {
        return err
      }
      const error = err as IValidationResponse
      return error.fields?.map(f => `${f.field}: ${f.error}`).join("; ") || error.error
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
    }
    const token = response as IToken
    setUserStorage(token)
    setLoginDialogText("You have successfully logged in")
    setTimeout(() => {
      handleLoginDialogClose()
    }, 500)
  }

  //#endregion


  const handleFieldChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, field: string, isLogin = true) => {
    const value = e.target.value?.trimStart()
    if (isLogin) {
      setSignInData(s => ({...s, [field]: value}))
      // remove error if there is a value now
      if (loginValidation[field]?.length > 0 && value?.length > 0) {
        setLoginValidation(v => ({...v, [field]: ''}))
      }
    } else {
      setSignUpData(s => ({...s, [field]: value}))
      // remove error if there is a value now
      if (registerValidation[field]?.length > 0 && value?.length > 0) {
        setRegisterValidation(v => ({...v, [field]: ''}))
      }
    }
  }

  const DarkThemeIcon = (): JSX.Element => {
    return (
      <Tooltip title={darkModeProps.darkMode ? "Light mode" : "Dark mode"}>
        {darkModeProps.darkMode
          ? <LightModeIcon fontSize="large" onClick={() => darkModeProps.changeMode()} sx={{pl: theme.spacing(1), cursor: 'pointer'}} />
          : <DarkModeIcon fontSize="large" onClick={() => darkModeProps.changeMode()} sx={{pl: theme.spacing(1), cursor: 'pointer'}} />
        }
      </Tooltip>
    )
  }
 
  return (
    <Box sx={{ flexGrow: 0 }}>
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
      <AppBar position="static">
        <Toolbar>
          <Typography variant={matchesXs ? "subtitle2" : "h5"} sx={matchesMd ? {  mr: 2, ml: '5vw' } : {}}>
            <span
              onClick={() => { history.push("/"); history.go(0); }}
              className={classes.title}
            >
              Game Library
            </span>
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          <Search sx={{ ml: 1 }}>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Enter game name"
              value={searchFieldProps.text}
              onChange={searchFieldProps.changeText}
            />
          </Search>

          {isAuthenticated
            ? <>
              <Tooltip title={name || ''}>
                <Avatar variant="square" style={matchesMd ? { marginLeft: '1vw' } : { marginLeft: theme.spacing(0.5) }} {...stringAvatar(name || '')}/>
              </Tooltip>
              {!matchesXs && 
                <Typography variant="subtitle1" sx={matchesMd ? { ml: 1 } : { ml: theme.spacing(0.5) }}>{username}</Typography>
              }
              <DarkThemeIcon/>
              { matchesXs
                ? <LogoutIcon color="action" fontSize="large" onClick={() => logout()} sx={{pl: theme.spacing(1)}} />
                : <Button color="inherit" sx={matchesMd ? { mr: '5vw', ml: theme.spacing(0.5) } : { ml: theme.spacing(0.5)}} onClick={() => logout()}>Logout</Button>
              }
            </>
            : <>
              <DarkThemeIcon/>
              { matchesXs
                ? <>
                  <Tooltip title="Register">
                    <HowToRegIcon fontSize="large" onClick={() => handleRegisterDialogOpen()} sx={{pl: theme.spacing(1)}}/>
                  </Tooltip>
                  <Tooltip title="Login">
                    <LoginIcon fontSize="large" onClick={() => handleLoginDialogOpen()} sx={{pl: theme.spacing(1)}} />
                  </Tooltip>
                </>
                : <ButtonGroup variant="text" size={matchesMd ? "large" : "medium" } sx={matchesMd ? { mr: '5vw', ml: theme.spacing(0.5) } : {}}>
                  <Button color="inherit" onClick={() => handleRegisterDialogOpen()}>Register</Button>
                  <Button color="inherit" onClick={() => handleLoginDialogOpen()}>Login</Button>
                </ButtonGroup>
              }
            </>
          }

          <Modal 
            fullwidth={matchesMd}
            matchesMd={matchesMd}
            isOpen={registerDialogOpen} 
            closeDialog={handleRegisterDialogClose} 
            title='Register'
            dialogText={registerDialogText} 
            dialogErrorText={registerErrorText} 
            submitActionName='Register' 
            handleSubmit={handleRegister}
          >
            <>
              <Grid item sx={{ minWidth: matchesMd ? '400px' : '210px' }}>
                <TextField
                  required
                  error={!!registerValidation.username}
                  helperText={registerValidation.username}
                  fullWidth
                  label="Username"
                  margin="normal"
                  value={signUpData?.username || ""}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => handleFieldChange(e, 'username', false)}
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
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => handleFieldChange(e, 'name', false)}
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
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => handleFieldChange(e, 'password', false)}
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
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => handleFieldChange(e, 'confirmPassword', false)}
                />
              </Grid>
              <Grid item sx={{ minWidth: matchesMd ? '400px' : '210px' }}>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={signUpData.isPublisher || false} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => (setSignUpData(d => ({...d, isPublisher: e.target.checked})))}
                    />}
                  label="I am a publisher"
                />
              </Grid>
            </>
          </Modal>

          <Modal
            fullwidth={matchesMd}
            matchesMd={matchesMd}
            isOpen={loginDialogOpen} 
            closeDialog={handleLoginDialogClose} 
            title='Login'
            dialogText={loginDialogText}
            dialogErrorText={loginErrorText} 
            submitActionName='Login' 
            handleSubmit={handleLogin}
          >
            <>
              <Grid item sx={{ minWidth: matchesMd ? '400px' : '210px' }}>
                <TextField
                  required
                  error={!!loginValidation.username}
                  helperText={loginValidation.username}
                  fullWidth
                  label="Username"
                  margin="normal"
                  value={signInData?.username || ""}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => handleFieldChange(e, 'username')}
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
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => handleFieldChange(e, 'password')}
                />
              </Grid>
            </>
          </Modal>
          
        </Toolbar>
      </AppBar>
    </Box>
  )
}

export default Header