import { useMemo, useState } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { Container, CssBaseline, Typography, useMediaQuery } from '@mui/material'
import { ThemeProvider, createTheme, StyledEngineProvider } from '@mui/material/styles'
import { grey, blueGrey, blue } from '@mui/material/colors'
import { GoogleOAuthProvider } from '@react-oauth/google'

import Landing from './views/Landing'
import Header from './components/Header'


const dmKey = 'gl_dark_mode'

const App = () => {

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

  const getIsDarkMode = (): boolean => {
    const darkModeValue = localStorage.getItem(dmKey)
    if (!darkModeValue) {
      return prefersDarkMode
    }
    return darkModeValue === "true"
  }

  const [darkMode, setDarkMode] = useState(getIsDarkMode())

  const theme = useMemo(() =>
    createTheme({
      palette: {
        mode: darkMode ? 'dark' : 'light',
        primary: {
          main: darkMode ? grey[300] : grey[700]
        },
        secondary: {
          main: darkMode ? blueGrey[300] : blue[900]
        },
        tonalOffset: 0.4
      }
    }),
    [darkMode]
  )

  const handleChangeMode = () => {
    setDarkMode(dm => {
      dm = !dm
      const dmValue = dm.toString()
      localStorage.setItem(dmKey, dmValue)
      return dm
    })
  }

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Landing darkModeProps={{darkMode: darkMode, changeMode: handleChangeMode}} />
    },
    {
      path: "*",
      element: 
        <>
          <Header darkModeProps={{darkMode: darkMode, changeMode: handleChangeMode}} searchFieldProps={{text: "", disabled: true} }/>
          <Container sx={{ paddingTop: theme.spacing(2) }} disableGutters={true}>
            <Typography variant="h5" sx={{textAlign: "center"}}>Page Not Found</Typography>
          </Container>
        </>
    }
  ])

  return (
    <GoogleOAuthProvider clientId={window._env_.GOOGLE_CLIENT_ID}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <RouterProvider router={router} />
        </ThemeProvider>
      </StyledEngineProvider>
    </GoogleOAuthProvider>
  )
}

export default App
