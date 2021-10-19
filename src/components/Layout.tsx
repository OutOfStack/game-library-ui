import { Container, Paper } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { Theme } from '@mui/material/styles'
import { grey } from '@mui/material/colors'

import Header from './Header'


const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 2,
    display: 'flex'
  },
  paper: {
    padding: theme.spacing(3),
    marginTop: '2px',
    backgroundColor: grey[300],
    variant: 'outlined'
  },
  container: {
    maxWidth: '1500px'
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