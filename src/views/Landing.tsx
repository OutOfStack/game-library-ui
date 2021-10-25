import React, { useState, useEffect } from 'react'
import { Alert, AlertColor, Backdrop, Box,  Button, CircularProgress, Container, Grid, 
  Snackbar, Typography } from '@mui/material'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'

import Layout from '../components/Layout'
import GameCard from '../components/GameCard'
import { ISearchFieldProps } from '../components/Header'
import { IGame } from '../types/Game'
import useGames from '../hooks/useGames'
import useUser from '../hooks/useUser'
import useAuth from '../hooks/useAuth'
import { IValidationResponse } from '../types/Validation'
import { roles } from '../auth/roles'
import { IGetUserRatingsResponse } from '../types/Rating'


const Landing = () => {

  const { fetchAllData, search: searchData } = useGames()
  const { fetchRatings } = useUser()
  const { hasRole, isAuthenticated } = useAuth()

  const defaultAlert = {
    open: false,
    message: "",
    severity: "success" as AlertColor
  }
  const defaultPagination = {
    pageSize: 20,
    lastId: 0
  }
  const [alert, setAlert] = useState(defaultAlert)
  const [data, setData] = useState<IGame[]>([])
  const [userRatings, setUserRatings] = useState<IGetUserRatingsResponse>({})
  const [isLoading, setIsLoading] = useState(false)
  const [pagination, setPagination] = useState(defaultPagination)
  const [searchText, setSearchText] = useState<string>("")
  const [prevSearchTextLen, setPrevSearchTextLen] = useState(0)
  const [lastUpdated, setLastUpdated] = useState(Date.now())

  const handleCloseAlert = (event?: React.SyntheticEvent, reason?: string) => {
    if (reason === 'clickaway') {
      return
    }
    setAlert(a => ({...defaultAlert, severity: a.severity}))
  }

  const showNotification = (message: string, severity: AlertColor = "success") => {
    setAlert({
      message: message,
      severity: severity,
      open: true
    })
  }

  const handleSearchTextChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setSearchText(e.target.value)
    // if removing text and length of search text less than 2
    if (e.target.value?.length < 2 && e.target.value?.length < prevSearchTextLen) {
      // force fetch all with pagination
      setLastUpdated(Date.now())
    }
    setPrevSearchTextLen(e.target.value?.length ?? 0)
  }

  const handlePagination = (forward: boolean = true) => {
    if (forward) {
      setPagination(p => ({...p, lastId: Math.max(...data.map(d => d.id), 0) }))
    } else {
      setPagination(p => ({
        ...p,
        lastId: Math.max(
          Math.min(...data.map(d => d.id)) - 1 - p.pageSize,
          0)
      }))
    }
  }

  // get user ratings
  useEffect(() => {
    const getRatings = async () => {
      setIsLoading(true)
      const gameIds = data.map(d => d.id)
      const [resp, err] = await fetchRatings({
        gameIds: gameIds
      })
      if (err) {
        if (typeof err === 'string') {
          showNotification(err, "error")
        } else {
          const error = err as IValidationResponse
          showNotification(error.fields?.map(f => `${f.field}: ${f.error}`).join("; ") || error.error, "error")
        }
        setIsLoading(false)
        return
      }
      const ratings = resp as IGetUserRatingsResponse
      setUserRatings(ratings)
      setIsLoading(false)
    }
    if (isAuthenticated && hasRole([roles.user])) {
      getRatings()
    }
  }, [data])

  // search by searchText when searchText changes
  useEffect(() => {
    const search = async () => {
      setIsLoading(true)
      const [resp, err] = await searchData(searchText)
      if (err) {
        if (typeof err === 'string') {
          showNotification(err, "error")
        } else {
          const error = err as IValidationResponse
          showNotification(error.fields?.map(f => `${f.field}: ${f.error}`).join("; ") || error.error, "error")
        }
        setIsLoading(false)
        return
      }
      const games = resp as IGame[]
      setData(games)
      setIsLoading(false)
    }
    if (searchText?.length > 1) {
      search()
    }
  }, [searchText])

  // fetch with pagination when page (lastId) or lastUpdate changes
  useEffect(() => {
    const getData = async () => {
      setIsLoading(true)
      const [resp, err] = await fetchAllData(pagination.pageSize, pagination.lastId)
      if (err) {
        if (typeof err === 'string') {
          showNotification(err, "error")
        } else {
          const error = err as IValidationResponse
          showNotification(error.fields?.map(f => `${f.field}: ${f.error}`).join("; ") || error.error, "error")
        }
        setIsLoading(false)
        return
      }
      const games = resp as IGame[]
      setData(games)
      setIsLoading(false)
    }
    getData()
  }, [pagination.lastId, lastUpdated])

  const searchFieldProps: ISearchFieldProps = {
    text: searchText,
    changeText: handleSearchTextChange
  }

  return (
    <Layout searchFieldProps={searchFieldProps}>
      <Container maxWidth="xl">
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={isLoading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
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
                <GameCard game={game} showUserRating={isAuthenticated && hasRole([roles.user])} userRating={userRatings[game.id?.toString()]}/>
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