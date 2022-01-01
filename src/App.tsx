import { BrowserRouter, Route } from 'react-router-dom'

import Landing from './views/Landing'
import ThemeConfig from './theme'


const App = () => {
  return (
    <ThemeConfig>
      <BrowserRouter>
        <Route path='/'>
          <Landing />
        </Route>
      </BrowserRouter>
    </ThemeConfig>
  )
}

export default App
