import { Box, Container, Paper } from '@mui/material'
import { grey } from '@mui/material/colors'

import Header, { ISearchFieldProps, IDarkModeProps } from './Header'


interface ILayoutProps {
  children: JSX.Element,
  searchFieldProps: ISearchFieldProps,
  darkModeProps: IDarkModeProps
}

const Layout = (props: ILayoutProps) => {
  const { children, searchFieldProps, darkModeProps } = props

  return (
    <Box>
      <Paper sx={{ backgroundColor: darkModeProps.darkMode ? grey[800] : grey[200], minHeight: '100vh' }} elevation={0}>
        <Header searchFieldProps={searchFieldProps} darkModeProps={darkModeProps} />
        <Container maxWidth="lg" sx={{ pt: 2 }}>
          {children}
        </Container>
      </Paper>
    </Box>
  )
}

export default Layout
