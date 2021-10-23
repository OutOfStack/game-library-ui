import { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Alert, AlertColor, AppBar, Box, Button, ButtonGroup, Dialog, DialogTitle, DialogContent, DialogActions, Grid, 
  Snackbar, TextField, Toolbar, Typography, useMediaQuery } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { useTheme } from '@mui/material/styles'
import { makeStyles } from '@mui/styles'

import { Search, SearchIconWrapper, StyledInputBase } from './SearchField'
import { ISignIn, IToken } from '../types/Auth/SignIn'
import useAuth from '../hooks/useAuth'


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

  const [signInData, setSignInData] = useState<ISignIn>({} as ISignIn)
  const [token, setToken] = useState("")
  const [loginDialogOpen, setLoginDialogOpen] = useState(false)
  const [loginDialogText, setLoginDialogText] = useState("")
  const [loginValidation, setLoginValidation] = useState<IValidation>({
    username: "",
    password: ""
  })
  
  const handleLoginDialogOpen = () => setLoginDialogOpen(true)
  const handleLoginDialogClose = () => setLoginDialogOpen(false)

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

  const handleSignIn = async () => {
    if (!validateLoginForm()) {
      return
    }
    const [resp, err] = await signIn(signInData)
    if (err) {
      showNotification(err, "error")
      return
    }
    const token = resp as IToken
    console.log(token)
    setToken(token.accessToken)
    setLoginDialogText("You have successfully logged in")
    setTimeout(() => {
      handleLoginDialogClose()
    }, 500)
  }

  const handleFieldChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, field: string) => {
    setSignInData(s => ({...s, [field]: e.target.value}))
    // remove error if there is a value now
    if (loginValidation[field]?.length > 0 && e.target.value?.length > 0) {
      setLoginValidation(v => ({...v, [field]: ''}))
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
          <ButtonGroup variant="text" size={matchesMd ? "large" : "small"} sx={matchesMd ? { mr: '5vw', ml: 2 } : {}}>
            <Button color="inherit">Register</Button>
            <Button color="inherit" onClick={() => handleLoginDialogOpen()}>Login</Button>
          </ButtonGroup>
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
                  </Grid>
                }
              </DialogContent>
              <DialogActions>
                <Button size="large" variant="contained" onClick={handleLoginDialogClose}>Cancel</Button>
                <Button size="large" variant="contained" color="success" onClick={handleSignIn}>Login</Button>
            </DialogActions>
          </Dialog>
        </Toolbar>
      </AppBar>
    </Box>
  )
}

export default Header