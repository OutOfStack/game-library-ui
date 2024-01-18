import { useMemo, useState } from 'react'
import { CssBaseline, useMediaQuery } from '@mui/material'
import { ThemeProvider, createTheme, StyledEngineProvider } from '@mui/material/styles'
import { grey, blueGrey, blue } from '@mui/material/colors'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import Landing from './views/Landing'


const dmKey = 'gl_dark_mode'

const App = () => {

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

  const getIsDarkMode = (): boolean => {
    const dmValue = localStorage.getItem(dmKey)
    if (!dmValue) {
      return prefersDarkMode
    }
    if (dmValue === "true") {
      return true
    }
    return false
  }

  const [darkMode, setDarkMode] = useState(getIsDarkMode())

  const theme = useMemo(
    () =>
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
    }
  ])

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemeProvider>
    </StyledEngineProvider>
  )
}

export default App
