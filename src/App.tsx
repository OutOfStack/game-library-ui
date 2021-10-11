import React from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { createTheme, ThemeProvider } from '@mui/material/styles'

import Landing from './views/Landing'


const theme = createTheme();

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Switch>
          <Route path='/'>
            <Landing />
          </Route>
        </Switch>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
