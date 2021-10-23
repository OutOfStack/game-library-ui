import { BrowserRouter, Route, Switch } from 'react-router-dom'

import Landing from './views/Landing'
import ThemeConfig from './theme'


const App = () => {
  return (
    <ThemeConfig>
      <BrowserRouter>
        <Switch>
          <Route path='/'>
            <Landing />
          </Route>
        </Switch>
      </BrowserRouter>
    </ThemeConfig>
  )
}

export default App
