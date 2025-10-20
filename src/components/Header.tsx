import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import {
  Alert, AlertColor, AppBar, Avatar, Box, Button,
  IconButton, Snackbar, Toolbar, Tooltip, Typography, useMediaQuery
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { makeStyles } from 'tss-react/mui'
import LoginIcon from '@mui/icons-material/LoginRounded'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import DarkModeIcon from '@mui/icons-material/DarkModeRounded'
import LightModeIcon from '@mui/icons-material/LightModeRounded'
import SearchIcon from '@mui/icons-material/SearchRounded'
import MenuIcon from '@mui/icons-material/Menu'

import { Search, SearchIconWrapper, StyledInputBase } from './SearchField'
import SignUpModal from '../components/SignUpModal'
import SignInModal from '../components/SignInModal'
import UserMenu from '../components/UserMenu'
import EmailVerificationModal from '../components/EmailVerificationModal'
import { IToken } from '../types/Auth/Claims'
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

const Header = (props: IHeaderProps) => {
  const { searchFieldProps, darkModeProps } = props

  const { getClaims, isAuthenticated, setUserTokenStorage, logout, verifyEmail, resendVerification } = useAuth()
  const { classes } = useStyles()
  const navigate = useNavigate()
  const theme = useTheme()
  const matchesMd = useMediaQuery(theme.breakpoints.up('md'))
  const matchesXs = useMediaQuery(theme.breakpoints.only('xs'))

  const { name, username, vrf_required } = getClaims()

  //#region notification

  const defaultAlert = {
    open: false,
    message: "",
    severity: "success" as AlertColor
  }
  const [alert, setAlert] = useState(defaultAlert)
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null)
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false)
  const [loginDialogOpen, setLoginDialogOpen] = useState(false)
  const [verifyEmailDialogOpen, setVerifyEmailDialogOpen] = useState(false)
  const [verifyEmailDismissed, setVerifyEmailDismissed] = useState(false)

  // Show verification modal automatically when vrf_required is true, but only if not manually dismissed
  useEffect(() => {
    if (isAuthenticated && vrf_required && !verifyEmailDialogOpen && !verifyEmailDismissed) {
      setVerifyEmailDialogOpen(true)
    }
  }, [isAuthenticated, vrf_required, verifyEmailDialogOpen, verifyEmailDismissed])

  const handleCloseAlert = (_: Event | React.SyntheticEvent<any, Event>, reason?: string) => {
    if (reason === 'clickaway') {
      return
    }
    setAlert(a => ({ ...defaultAlert, severity: a.severity }))
  }

  //#endregion

  //#region modal handlers

  const handleSignUpSuccess = (token: IToken) => {
    setUserTokenStorage(token)
    setRegisterDialogOpen(false)
  }

  const handleSignInSuccess = (token: IToken) => {
    setUserTokenStorage(token)
    setLoginDialogOpen(false)
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setMenuAnchorEl(null)
  }

  const handleDeleteSuccess = () => {
    setAlert({
      open: true,
      message: 'Account deleted successfully',
      severity: 'success'
    })
    setTimeout(() => {
      logout()
    }, 1000)
  }

  const handleDeleteError = (error: string) => {
    setAlert({
      open: true,
      message: error,
      severity: 'error'
    })
  }

  //#endregion

  //#region email verification

  const handleVerifyEmail = async (code: string): Promise<void> => {
    const [resp, err] = await verifyEmail({ code })
    if (err) {
      const errorMessage = typeof err === 'string' ? err : (err as IValidationResponse).error
      throw errorMessage
    }
    const token = resp as IToken
    setUserTokenStorage(token)
    setVerifyEmailDialogOpen(false)
  }

  const handleResendVerification = async (): Promise<void> => {
    const [, err] = await resendVerification()
    if (err) {
      throw err
    }
  }

  //#endregion

  const DarkThemeIcon = () => {
    return (
      <Tooltip title={darkModeProps.darkMode ? "Light mode" : "Dark mode"}>
        {darkModeProps.darkMode
          ? <LightModeIcon fontSize="large" onClick={() => darkModeProps.changeMode()} sx={{ pl: theme.spacing(1), cursor: 'pointer' }} />
          : <DarkModeIcon fontSize="large" onClick={() => darkModeProps.changeMode()} sx={{ pl: theme.spacing(1), cursor: 'pointer' }} />
        }
      </Tooltip>
    )
  }

  return (
    <Box sx={{ flexGrow: 0 }}>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={alert.open}
        autoHideDuration={5000}
        onClose={handleCloseAlert}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={alert.severity}
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
      <AppBar
        position="sticky"
        color="default"
        sx={{
          backdropFilter: 'saturate(180%) blur(6px)',
          bgcolor: 'background.paper',
          backgroundImage: 'none',
          boxShadow: 'none',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Toolbar sx={matchesXs ? { pr: 1, pl: 1 } : {}}>
          <Typography
            variant={matchesXs ? 'subtitle2' : 'h5'}
            sx={matchesMd ? { mr: 2, ml: '5vw' } : {}}
          >
            <span
              onClick={() => { navigate("/"); navigate(0) }}
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
              <Tooltip title={name || username || ''}>
                <Avatar variant="square" style={matchesMd ? { marginLeft: '1vw' } : { marginLeft: theme.spacing(0.5) }} {...stringAvatar(name || username || '')} />
              </Tooltip>
              {!matchesXs &&
                <Typography variant="subtitle1" sx={matchesMd ? { ml: 1 } : { ml: theme.spacing(0.5) }}>{username}</Typography>
              }
              <DarkThemeIcon />
              {matchesXs
                ? <Tooltip title="User menu">
                  <IconButton onClick={handleMenuOpen} sx={{ pl: theme.spacing(1) }}>
                    <MenuIcon color="action" fontSize="large" />
                  </IconButton>
                </Tooltip>
                : <IconButton onClick={handleMenuOpen} sx={matchesMd ? { mr: '5vw', ml: theme.spacing(0.5) } : { ml: theme.spacing(0.5) }}>
                  <MenuIcon color="inherit" />
                </IconButton>
              }
              <UserMenu
                anchorEl={menuAnchorEl}
                onClose={handleMenuClose}
                vrf_required={vrf_required}
                onVerifyEmailClick={() => {
                  setVerifyEmailDialogOpen(true)
                  setVerifyEmailDismissed(false)
                }}
                onLogout={logout}
                onDeleteSuccess={handleDeleteSuccess}
                onDeleteError={handleDeleteError}
              />
            </>
            : <>
              <DarkThemeIcon />
              {matchesXs
                ? <>
                  <Tooltip title="Register">
                    <PersonAddIcon fontSize="large" onClick={() => setRegisterDialogOpen(true)} sx={{ pl: theme.spacing(1) }} />
                  </Tooltip>
                  <Tooltip title="Login">
                    <LoginIcon fontSize="large" onClick={() => setLoginDialogOpen(true)} sx={{ pl: theme.spacing(1) }} />
                  </Tooltip>
                </>
                : <Box sx={matchesMd ? { mr: '5vw', ml: theme.spacing(0.5) } : {}} >
                  <Button color="inherit" onClick={() => setRegisterDialogOpen(true)}>Register</Button>
                  <Button color="inherit" onClick={() => setLoginDialogOpen(true)}>Login</Button>
                </Box>
              }
            </>
          }

          <SignUpModal
            isOpen={registerDialogOpen}
            onClose={() => setRegisterDialogOpen(false)}
            onSuccess={handleSignUpSuccess}
          />

          <SignInModal
            isOpen={loginDialogOpen}
            onClose={() => setLoginDialogOpen(false)}
            onSuccess={handleSignInSuccess}
          />

          <EmailVerificationModal
            isOpen={verifyEmailDialogOpen}
            closeDialog={() => {
              setVerifyEmailDialogOpen(false)
              setVerifyEmailDismissed(true)
            }}
            handleSubmit={handleVerifyEmail}
            handleResend={handleResendVerification}
          />
        </Toolbar>
      </AppBar>
    </Box>
  )
}

export default Header
