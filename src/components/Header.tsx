import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Alert, AlertColor, AppBar, Avatar, Box, Button, Checkbox, FormControlLabel, Grid, 
  IconButton, Link, Menu, MenuItem, Snackbar, TextField, Toolbar, Tooltip, Typography, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { makeStyles } from 'tss-react/mui'
import LoginIcon from '@mui/icons-material/LoginRounded'
import LogoutIcon from '@mui/icons-material/LogoutRounded'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import DarkModeIcon from '@mui/icons-material/DarkModeRounded'
import LightModeIcon from '@mui/icons-material/LightModeRounded'
import SearchIcon from '@mui/icons-material/SearchRounded'
import MenuIcon from '@mui/icons-material/Menu'
import DeleteIcon from '@mui/icons-material/Delete'

import { Search, SearchIconWrapper, StyledInputBase } from './SearchField'
import Modal from '../components/Modal'
import { ISignIn, IToken } from '../types/Auth/SignIn'
import { ISignUp } from '../types/Auth/SignUp'
import { IGetUser } from '../types/Auth/User'
import { IValidationResponse } from '../types/Validation'
import { stringAvatar } from '../utils/avatar'
import useAuth from '../hooks/useAuth'


const useStyles = makeStyles()(() => ({
  title: {
    cursor: 'pointer'
  }
}))

export interface ISearchFieldProps {
  text: string,
  changeText?: (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void,
  disabled?: boolean
}

export interface IDarkModeProps {
  darkMode: boolean,
  changeMode: () => void
}

export interface IHeaderProps {
  searchFieldProps: ISearchFieldProps,
  darkModeProps: IDarkModeProps,
}

interface IValidation {
  username: string,
  password: string,
  [index: string]: string
}

const Header = (props: IHeaderProps) => {

  const { searchFieldProps, darkModeProps } = props

  const { signIn, signUp, getClaims, isAuthenticated, setUserStorage, logout, deleteAccount } = useAuth()
  const { classes } = useStyles()
  const navigate = useNavigate()
  const theme = useTheme()
  const matchesMd = useMediaQuery(theme.breakpoints.up('md'))
  const matchesXs = useMediaQuery(theme.breakpoints.only('xs'))

  const { name, username } = getClaims()

  //#region notification

  const defaultAlert = {
    open: false,
    message: "",
    severity: "success" as AlertColor
  }
  const [alert, setAlert] = useState(defaultAlert)
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  const handleCloseAlert = (event: Event | React.SyntheticEvent<any, Event>, reason?: string) => {
    if (reason === 'clickaway') {
      return
    }
    setAlert(a => ({...defaultAlert, severity: a.severity}))
  }

  //#endregion

  //#region sign up
  
  const [signUpData, setSignUpData] = useState<ISignUp>({} as ISignUp)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false)
  const [registerDialogText, setRegisterDialogText] = useState("")
  const [registerErrorText, setRegisterErrorText] = useState("")
  const [registerValidation, setRegisterValidation] = useState<IValidation>({
    username: "",
    name: "",
    password: "",
    confirmPassword: "",
    terms: ""
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

    if (!termsAccepted) {
      setRegisterValidation(v => ({...v, terms: 'you must agree to the terms and privacy policy'}))
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

  //#region user menu

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setMenuAnchorEl(null)
  }

  const handleDeleteAccountOpen = () => {
    setDeleteConfirmOpen(true)
    handleMenuClose()
  }

  const handleDeleteAccountClose = () => {
    setDeleteConfirmOpen(false)
  }

  const handleDeleteAccount = async () => {
    const [_, err] = await deleteAccount()
    if (err) {
      setAlert({
        open: true,
        message: typeof err === 'string' ? err : 'Failed to delete account',
        severity: 'error'
      })
    } else {
      setAlert({
        open: true,
        message: 'Account deleted successfully',
        severity: 'success'
      })
      setTimeout(() => {
        logout()
      }, 1000)
    }
    setDeleteConfirmOpen(false)
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
              onClick={() => {navigate("/"); navigate(0)}}
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
              disabled={searchFieldProps.disabled}
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
                ? <Tooltip title="User menu">
                    <IconButton onClick={handleMenuOpen} sx={{pl: theme.spacing(1)}}>
                      <MenuIcon color="action" fontSize="large" />
                    </IconButton>
                  </Tooltip>
                : <IconButton onClick={handleMenuOpen} sx={matchesMd ? { mr: '5vw', ml: theme.spacing(0.5) } : { ml: theme.spacing(0.5)}}>
                    <MenuIcon color="inherit" />
                  </IconButton>
              }
              <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem onClick={() => { logout(); handleMenuClose(); }}>
                  <LogoutIcon sx={{ mr: 1 }} />
                  Logout
                </MenuItem>
                <MenuItem onClick={handleDeleteAccountOpen} sx={{ color: 'error.main' }}>
                  <DeleteIcon sx={{ mr: 1 }} />
                  Delete Account
                </MenuItem>
              </Menu>
            </>
            : <>
              <DarkThemeIcon/>
              { matchesXs
                ? <>
                  <Tooltip title="Register">
                    <PersonAddIcon fontSize="large" onClick={() => handleRegisterDialogOpen()} sx={{pl: theme.spacing(1)}}/>
                  </Tooltip>
                  <Tooltip title="Login">
                    <LoginIcon fontSize="large" onClick={() => handleLoginDialogOpen()} sx={{pl: theme.spacing(1)}} />
                  </Tooltip>
                </>
                : <Box sx={matchesMd ? { mr: '5vw', ml: theme.spacing(0.5) } : {}} >
                  <Button color="inherit" onClick={() => handleRegisterDialogOpen()}>Register</Button>
                  <Button color="inherit" onClick={() => handleLoginDialogOpen()}>Login</Button>
                </Box>
              }
            </>
          }

          <Modal 
            fullScreen
            matchesMd={matchesMd}
            isOpen={registerDialogOpen} 
            closeDialog={handleRegisterDialogClose} 
            title='Register'
            dialogText={registerDialogText} 
            dialogErrorText={registerErrorText} 
            submitActionName='Register' 
            submitDisabled={!termsAccepted}
            handleSubmit={handleRegister}
          >
            <>
              <Grid sx={{ minWidth: matchesMd ? '400px' : '210px' }}>
                <TextField
                  required
                  error={!!registerValidation.username}
                  helperText={registerValidation.username}
                  fullWidth
                  label="Username"
                  margin="normal"
                  name="username"
                  value={signUpData?.username || ""}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => handleFieldChange(e, 'username', false)}
                />
              </Grid>
              <Grid sx={{ minWidth: matchesMd ? '400px' : '210px' }}>
                <TextField
                  required
                  error={!!registerValidation.name}
                  helperText={registerValidation.name}
                  fullWidth
                  label="Name"
                  margin="normal"
                  name="name"
                  value={signUpData?.name || ""}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => handleFieldChange(e, 'name', false)}
                />
              </Grid>
              <Grid sx={{ minWidth: matchesMd ? '400px' : '210px' }}>
                <TextField
                  required
                  error={!!registerValidation.password}
                  helperText={registerValidation.password}
                  fullWidth
                  margin="normal"
                  label="Password"
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  value={signUpData?.password || ""}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => handleFieldChange(e, 'password', false)}
                />
              </Grid>
              <Grid sx={{ minWidth: matchesMd ? '400px' : '210px' }}>
                <TextField
                  required
                  error={!!registerValidation.confirmPassword}
                  helperText={registerValidation.confirmPassword}
                  fullWidth
                  margin="normal"
                  label="Confirm password"
                  type="password"
                  name="confirm-password"
                  value={signUpData?.confirmPassword || ""}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => handleFieldChange(e, 'confirmPassword', false)}
                />
              </Grid>
              <Grid sx={{ minWidth: matchesMd ? '400px' : '210px' }}>
                <Tooltip title="Contributors can add games to the library but cannot rate games" placement="right">
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={signUpData.isPublisher || false} 
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => (setSignUpData(d => ({...d, isPublisher: e.target.checked})))}
                      />}
                    label="I want to contribute games"
                  />
                </Tooltip>
              </Grid>
              <Grid sx={{ minWidth: matchesMd ? '400px' : '210px' }}>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={termsAccepted} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setTermsAccepted(e.target.checked)
                        if (registerValidation.terms && e.target.checked) {
                          setRegisterValidation(v => ({...v, terms: ''}))
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
                {registerValidation.terms && (
                  <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                    {registerValidation.terms}
                  </Typography>
                )}
              </Grid>
            </>
          </Modal>
          
          <Modal
            fullScreen
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
              <Grid sx={{ minWidth: matchesMd ? '400px' : '210px' }}>
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
              <Grid sx={{ minWidth: matchesMd ? '400px' : '210px' }}>
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

          <Modal
            fullScreen={false}
            matchesMd={matchesMd}
            isOpen={deleteConfirmOpen}
            closeDialog={handleDeleteAccountClose}
            title='Delete Account'
            dialogText=''
            dialogErrorText=''
            submitActionName='Delete Account'
            handleSubmit={handleDeleteAccount}
          >
            <Typography variant="body2" color="error" sx={{ textAlign: 'center', mb: 2 }}>
              Are you sure you want to delete your account?
            </Typography>
            <Typography variant="body2" color="error" sx={{ textAlign: 'center' }}>
              This action cannot be undone and will permanently delete your account.
            </Typography>
          </Modal>
          
        </Toolbar>
      </AppBar>
    </Box>
  )
}

export default Header