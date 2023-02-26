import { Container, Paper } from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import { Theme } from '@mui/material/styles'
import { grey } from '@mui/material/colors'

import Header, { ISearchFieldProps, IDarkModeProps } from './Header'

interface ILayoutProps {
  children: JSX.Element,
  searchFieldProps: ISearchFieldProps,
  darkModeProps: IDarkModeProps
}

const Layout = (props: ILayoutProps) => {
  const { children, searchFieldProps, darkModeProps } = props
  
  const useStyles = makeStyles()((theme: Theme) => ({
    paper: {
      backgroundColor: darkModeProps.darkMode ? grey[800] : grey[200],
      minHeight: '100vh',
      elevation: 0
    },
    container: {
      paddingTop: theme.spacing(2),
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1)
    }
  }))

  const { classes } = useStyles()

  return (
    <div>
      <Paper className={classes.paper}>
        <Header searchFieldProps={searchFieldProps} darkModeProps={darkModeProps} />
        <Container className={classes.container} disableGutters={true}>
          {children}
        </Container>
      </Paper>
    </div>
  )
}

export default Layout