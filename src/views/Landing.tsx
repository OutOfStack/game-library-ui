import React, {useState, useEffect }from 'react'
import { Alert, AlertColor, Box, Container, Grid, Snackbar, Typography } from '@mui/material'

import Layout from '../components/Layout'
import GameCard from '../components/GameCard'
import { IGame } from '../types/Game'
import useGames from '../hooks/useGames'


const Landing = (): JSX.Element => {

  const defaultAlert = {
    open: false,
    message: "",
    severity: "success" as AlertColor
  }
  const [alert, setAlert] = useState(defaultAlert)
  const [data, setData] = useState<IGame[]>([])

  const { fetchAllData } = useGames()

  const handleCloseAlert = (event?: React.SyntheticEvent, reason?: string) => {
    if (reason === 'clickaway') {
      return
    }
    setAlert(defaultAlert)
  }

  const showNotification = (message: string, severity: AlertColor = "success") => {
    setAlert({
      message: message,
      severity: severity,
      open: true
    })
  }

  useEffect(() => {
    const getData = async () => {
      const [resp, err] = await fetchAllData()
      if (err) {
        showNotification(err, "error")
        return
      }
      const games = resp as IGame[]
      setData(games)
    }
    getData()
  }, [])

  return (
    <Layout>
      <Container maxWidth="xl">
        <Snackbar 
          anchorOrigin={{ vertical: 'top', horizontal: 'right'}} 
          open={alert.open}
          autoHideDuration={5000} 
          onClose={handleCloseAlert}
        >
          <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }} >
            {alert.message}
          </Alert>
        </Snackbar>
        <Box sx={{ pb: 3 }}>
          <Typography variant="h4" sx={{pb: 3}}>Games</Typography>
          <Grid container spacing={3}>
            {data.map((game: IGame) => (
              <Grid key={game.id} item xs={12} sm={6} md={3}>
                <GameCard game={game} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Layout>
  )
}

export default Landing