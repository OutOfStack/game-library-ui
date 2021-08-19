import React from 'react'
import { AppBar, Toolbar, Typography } from '@material-ui/core'
import { useHistory } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  title: {
    cursor: 'pointer'
  }
}))

const Header = () => {
  const classes = useStyles()
  const history = useHistory()

  return (
    <AppBar position="static" >
      <Toolbar>
        <Typography variant="h5">
          <span 
            onClick={() => history.push('/')} 
            className={classes.title}
          >
            Game Library
          </span>
        </Typography>
      </Toolbar>
    </AppBar>
  )
}

export default Header