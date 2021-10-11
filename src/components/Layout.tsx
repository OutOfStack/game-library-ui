import React from 'react'
import { CssBaseline, Container, Paper } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { Theme } from '@mui/material/styles'

import Header from './Header'


const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 2,
    display: 'flex'
  },
  paper: {
    padding: theme.spacing(3),
    marginTop: '3px',
    variant: 'outlined'
  },
  container: {
    disableGutters: true
  }
}));

interface LayoutProps {
  children: JSX.Element
}

const Layout = (props: LayoutProps) => {
  const { children } = props

  const classes = useStyles()

  return (
    <div>
      <CssBaseline />
      <Header/>
      <Paper className={classes.paper}>
        <Container className={classes.container}>
          {children}
        </Container>
      </Paper>
    </div>
  )
}

export default Layout