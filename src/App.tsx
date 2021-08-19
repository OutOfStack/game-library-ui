import React from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import Landing from './views/Landing'

const App = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route path='/'>
          <Landing />
        </Route>
      </Switch>
    </BrowserRouter>
  )
}

export default App
