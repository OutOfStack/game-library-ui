import React from 'react'
import { Container, Paper, CssBaseline } from '@material-ui/core'
import Header from './Header'

import { makeStyles, Theme } from '@material-ui/core/styles'

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