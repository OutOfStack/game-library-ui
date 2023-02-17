import { Container, Paper } from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import { Theme } from '@mui/material/styles'
import { grey } from '@mui/material/colors'

import Header, { ISearchFieldProps } from './Header'


const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    flexGrow: 2,
    display: 'flex'
  },
  paper: {
    padding: theme.spacing(1),
    marginTop: '2px',
    backgroundColor: grey[300],
    variant: 'outlined'
  },
  container: {
    maxWidth: '1500px'
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
      <Header searchFieldProps={searchFieldProps} />
      <Paper className={classes.paper}>
        <Container className={classes.container} disableGutters={true}>
          {children}
        </Container>
      </Paper>
    </div>
  )
}

export default Layout