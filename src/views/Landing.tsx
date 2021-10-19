import React, {useState, useEffect }from 'react'
import { Alert, AlertColor, Box, Button, Container, Grid, Snackbar, Typography } from '@mui/material'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'

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
  const [isLoading, setIsLoading] = useState(false)
  const [pagination, setPagination] = useState({
    pageSize: 20,
    lastId: 0
  })

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

  const handlePagination = (forward: boolean = true) => {
    if (forward) {
      setPagination(p => ({...p, lastId: p.lastId + p.pageSize}))
    } else {
      const lastId = 
      setPagination(p => ({
        ...p, 
        lastId: p.lastId - p.pageSize < 0 ? 0 : p.lastId - p.pageSize
      }))
    }
  }

  useEffect(() => {
    const getData = async () => {
      const [resp, err] = await fetchAllData(pagination.pageSize, pagination.lastId)
      if (err) {
        showNotification(err, "error")
        return
      }
      const games = resp as IGame[]
      setData(games)
    }
    setIsLoading(true)
    getData()
    setIsLoading(false)
  }, [pagination.lastId])

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
              <Grid key={game.id} item xs={12} sm={6} md={4} lg={3}>
                <GameCard game={game} />
              </Grid>
            ))}
          </Grid>
          <Grid container direction="row" justifyContent="space-around" alignItems="flex-start" spacing={3}>
            <Grid key='prev' item md={6} sx={{mt: 2}}>
              {pagination.lastId !== 0 &&
                <Button 
                  disableElevation 
                  size="large"
                  startIcon={<NavigateBeforeIcon fontSize="large" />}
                  sx={{fontSize: '28px'}}
                  onClick={() => handlePagination(false)}
                >
                  PREVIOUS
                </Button>
              }
            </Grid>
            <Grid key='next' item md={6} sx={{mt: 2, textAlign: 'right'}}>
              {pagination.pageSize === data.length &&
                <Button
                  disableElevation 
                  size="large"
                  endIcon={<NavigateNextIcon fontSize="large" />}
                  sx={{fontSize: '28px'}}
                  onClick={() => handlePagination(true)}
                >
                  NEXT
                </Button>
              }
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Layout>
  )
}

export default Landing