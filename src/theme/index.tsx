import React from 'react'
import { CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme, StyledEngineProvider } from '@mui/material/styles';

interface ThemeProps {
  children: JSX.Element
}

const ThemeConfig = (props: ThemeProps) => {
  const { children } = props

  const theme = createTheme({
    palette: {
      primary: {
        light: '#a4a4a4',
        main: '#757575',
        dark: '#494949',
        contrastText: '#ffffff',
      },
      secondary: {
        light: '#e2f1f8',
        main: '#b0bec5',
        dark: '#808e95',
        contrastText: '#fafafa',
      },
    }
  })

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </StyledEngineProvider>
  )
}

export default ThemeConfig;