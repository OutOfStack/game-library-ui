import { Suspense, useMemo, useState, lazy } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { Container, CssBaseline, Typography, useMediaQuery } from '@mui/material'
import { ThemeProvider, createTheme, StyledEngineProvider } from '@mui/material/styles'
import { GoogleOAuthProvider } from '@react-oauth/google'

import Header from './components/Header'
import GitHubCallbackPage from './views/GitHubCallback'
const Landing = lazy(() => import('./views/Landing'))


const dmKey = 'gl_dark_mode'

const App = () => {

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

  const getIsDarkMode = (): boolean => {
    const darkModeValue = localStorage.getItem(dmKey)
    if (!darkModeValue) {
      return prefersDarkMode
    }
    return darkModeValue === "true"
  }

  const [darkMode, setDarkMode] = useState(getIsDarkMode())

  const theme = useMemo(() => {
    const accent = 'hsl(188, 72%, 52%)'
    const dark = {
      bg: '#0b0c0e',
      paper: '#141518',
      paperHover: '#1c1d22',
      textPrimary: '#ECECEE',
      textSecondary: '#9A9AA1',
      textDisabled: '#5e5e66',
      line: 'rgba(255,255,255,0.07)',
      lineHi: 'rgba(255,255,255,0.12)',
    }
    const light = {
      bg: '#F6F5F2',
      paper: '#FFFFFF',
      paperHover: '#FAF9F6',
      textPrimary: '#16171A',
      textSecondary: '#5b5d63',
      textDisabled: '#9b9da3',
      line: 'rgba(0,0,0,0.08)',
      lineHi: 'rgba(0,0,0,0.14)',
    }
    const c = darkMode ? dark : light

    return createTheme({
      palette: {
        mode: darkMode ? 'dark' : 'light',
        primary: { main: accent, contrastText: '#fff' },
        secondary: { main: c.textSecondary },
        background: { default: c.bg, paper: c.paper },
        divider: c.line,
        text: { primary: c.textPrimary, secondary: c.textSecondary, disabled: c.textDisabled },
        tonalOffset: 0.2,
      },
      shape: { borderRadius: 10 },
      typography: {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        h1: { fontFamily: 'Fraunces, serif', fontWeight: 600, letterSpacing: '-0.02em' },
        h2: { fontFamily: 'Fraunces, serif', fontWeight: 600, letterSpacing: '-0.02em' },
        h3: { fontFamily: 'Fraunces, serif', fontWeight: 600, letterSpacing: '-0.02em' },
        h4: { fontFamily: 'Fraunces, serif', fontWeight: 600, letterSpacing: '-0.015em' },
        h5: { fontFamily: 'Fraunces, serif', fontWeight: 600, letterSpacing: '-0.01em' },
        overline: { fontFamily: 'JetBrains Mono, ui-monospace, monospace', letterSpacing: '0.08em', fontWeight: 500, fontSize: 11 },
        button: { textTransform: 'none' as const, fontWeight: 600, letterSpacing: 0 },
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: { backgroundColor: c.bg, color: c.textPrimary },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: { boxShadow: 'none', '&:hover': { boxShadow: 'none' } },
          },
        },
        MuiToggleButton: {
          styleOverrides: {
            root: {
              border: 'none',
              textTransform: 'none' as const,
              fontWeight: 500,
              '&.Mui-selected': {
                background: darkMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
                '&:hover': { background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)' },
              },
            },
          },
        },
        MuiToggleButtonGroup: {
          styleOverrides: {
            root: {
              background: c.paperHover,
              border: `1px solid ${c.line}`,
              borderRadius: 10,
              padding: 3,
              gap: 2,
            },
            grouped: { '&:not(:first-of-type)': { borderRadius: 8 }, '&:first-of-type': { borderRadius: 8 } },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: { borderRadius: 999, fontWeight: 500 },
            outlined: { borderColor: c.line },
          },
        },
        MuiPaper: {
          styleOverrides: { root: { backgroundImage: 'none' } },
        },
        MuiCard: {
          styleOverrides: { root: { backgroundImage: 'none' } },
        },
        MuiTooltip: {
          styleOverrides: {
            tooltip: { fontSize: 12, fontWeight: 500, borderRadius: 6, paddingInline: 8, paddingBlock: 4 },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              backdropFilter: 'saturate(160%) blur(10px)',
              background: darkMode ? 'rgba(11,12,14,0.72)' : 'rgba(246,245,242,0.82)',
              backgroundImage: 'none',
              boxShadow: 'none',
              borderBottom: `1px solid ${c.line}`,
            },
          },
        },
      },
    })
  }, [darkMode])

  const handleChangeMode = () => {
    setDarkMode(dm => {
      dm = !dm
      const dmValue = dm.toString()
      localStorage.setItem(dmKey, dmValue)
      return dm
    })
  }

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <Suspense fallback={<div style={{ display: 'grid', placeItems: 'center', minHeight: '50vh' }}>Loading…</div>}>
          <Landing darkModeProps={{ darkMode: darkMode, changeMode: handleChangeMode }} />
        </Suspense>
      )
    },
    {
      path: "/oauth/github/callback",
      element: <GitHubCallbackPage />
    },
    {
      path: "*",
      element:
        <>
          <Header darkModeProps={{ darkMode: darkMode, changeMode: handleChangeMode }} searchFieldProps={{ text: "", disabled: true }} />
          <Container sx={{ paddingTop: theme.spacing(2) }} disableGutters={true}>
            <Typography variant="h5" sx={{ textAlign: "center" }}>Page Not Found</Typography>
          </Container>
        </>
    }
  ])

  return (
    <GoogleOAuthProvider clientId={window._env_.GOOGLE_CLIENT_ID}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <RouterProvider router={router} />
        </ThemeProvider>
      </StyledEngineProvider>
    </GoogleOAuthProvider>
  )
}

export default App
