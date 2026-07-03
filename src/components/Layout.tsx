import { Box, Container } from '@mui/material'

import Header, { ISearchFieldProps, IDarkModeProps } from './Header'


interface ILayoutProps {
  children: JSX.Element,
  searchFieldProps: ISearchFieldProps,
  darkModeProps: IDarkModeProps
}

const Layout = (props: ILayoutProps) => {
  const { children, searchFieldProps, darkModeProps } = props

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Header searchFieldProps={searchFieldProps} darkModeProps={darkModeProps} />
      <Container maxWidth="lg" sx={{ pt: 2 }}>
        {children}
      </Container>
    </Box>
  )
}

export default Layout
