import React from 'react'
import { useHistory } from 'react-router-dom'
import { AppBar, Toolbar, Typography } from '@mui/material'
import { makeStyles } from '@mui/styles'

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