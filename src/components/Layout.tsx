import { Container, Paper } from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import { Theme } from '@mui/material/styles'
import { grey } from '@mui/material/colors'

import Header, { ISearchFieldProps } from './Header'


const useStyles = makeStyles()((theme: Theme) => ({
  paper: {
    backgroundColor: grey[200],
    minHeight: '100vh',
    elevation: 0
  },
  container: {
    paddingTop: theme.spacing(2),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1)
  }
}));

interface LayoutProps {
  children: JSX.Element,
  searchFieldProps: ISearchFieldProps
}

const Layout = (props: LayoutProps) => {
  const { children, searchFieldProps } = props

  const { classes } = useStyles()

  return (
    <div>
      <Paper className={classes.paper}>
        <Header searchFieldProps={searchFieldProps} />
        <Container className={classes.container} disableGutters={true}>
          {children}
        </Container>
      </Paper>
    </div>
  )
}

export default Layout