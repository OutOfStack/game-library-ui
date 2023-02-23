import { useMemo, useState } from 'react'
import useMediaQuery from '@mui/material/useMediaQuery'
import { CssBaseline } from '@mui/material'
import { ThemeProvider, createTheme, StyledEngineProvider } from '@mui/material/styles'
import { BrowserRouter, Route } from 'react-router-dom'

import Landing from './views/Landing'
import { IDarkModeProps } from './components/Header'


const App = () => {
  const [darkMode, setDarkMode] = useState(useMediaQuery('(prefers-color-scheme: dark)'))

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
          primary: {
            light: '#a4a4a4',
            main: '#757575',
            dark: '#494949',
            contrastText: '#ffffff'
          },
          secondary: {
            light: '#e2f1f8',
            main: '#b0bec5',
            dark: '#808e95',
            contrastText: '#fafafa'
          }
        }
      }),
    [darkMode]
  )

  const darkModeProps: IDarkModeProps = {
    darkMode: darkMode,
    changeMode: () => {setDarkMode(dm => (!dm))}
  }

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Route path='/'>
            <Landing darkModeProps={darkModeProps} />
          </Route>
        </BrowserRouter>
      </ThemeProvider>
    </StyledEngineProvider>
  )
}

export default App
