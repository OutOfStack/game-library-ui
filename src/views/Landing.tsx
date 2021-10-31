import React, { useState, useEffect } from 'react'
import { Alert, AlertColor, Backdrop, Box,  Button, CircularProgress, Container, Dialog, DialogActions, DialogContent, DialogTitle, Grid, 
  Snackbar, TextField, Typography, useMediaQuery, useTheme } from '@mui/material'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import DateAdapter from '@mui/lab/AdapterMoment'
import { MobileDatePicker, DesktopDatePicker, LocalizationProvider } from '@mui/lab'
import moment from 'moment'

import Layout from '../components/Layout'
import GameCard from '../components/GameCard'
import { ISearchFieldProps } from '../components/Header'
import { ICreateGame, IGame, IGameResponse } from '../types/Game'
import useGames from '../hooks/useGames'
import useUser from '../hooks/useUser'
import useAuth from '../hooks/useAuth'
import { IValidationResponse } from '../types/Validation'
import { roles } from '../auth/roles'
import { IGetUserRatingsResponse } from '../types/Rating'
import { isTouchDevice } from '../utils/devices'


const Landing = () => {

  const { fetchAllData, search: searchData, postData } = useGames()
  const { fetchRatings } = useUser()
  const { hasRole, isAuthenticated } = useAuth()
  const theme = useTheme()
  const matchesMd = useMediaQuery(theme.breakpoints.up('md'))
  
  const defaultPagination = {
    pageSize: 20,
    lastId: 0
  }
  
  const [data, setData] = useState<IGame[]>([])
  const [userRatings, setUserRatings] = useState<IGetUserRatingsResponse>({})
  const [isLoading, setIsLoading] = useState(false)
  const [pagination, setPagination] = useState(defaultPagination)
  const [searchText, setSearchText] = useState<string>("")
  const [prevSearchTextLen, setPrevSearchTextLen] = useState(0)
  const [lastUpdated, setLastUpdated] = useState(Date.now())

  //#region notification

  const defaultAlert = {
    open: false,
    message: "",
    severity: "success" as AlertColor
  }
  const [alert, setAlert] = useState(defaultAlert)

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

  //#endregion

  //#region add game

  interface IAddGameValidation {
    name: string,
	  developer: string,
	  releaseDate: string,
	  price: string,
    [index: string]: string
  }

  const [addGame, setAddGame] = useState<ICreateGame>({} as ICreateGame)
  const [addGameDialogOpen, setAddGameDialogOpen] = useState(false)
  const [addGameDialogText, setAddGameDialogText] = useState("")
  const [addGameErrorText, setAddGameErrorText] = useState("")
  const [addGameValidation, setAddGameValidation] = useState<IAddGameValidation>({
    name: "",
	  developer: "",
	  releaseDate: "",
	  price: ""
  })

  const handleAddGameDialogOpen = () => setAddGameDialogOpen(true)
  const handleAddGameDialogClose = () => setAddGameDialogOpen(false)
  
  const handleAddGameFieldChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, field: string) => {
    const value = e.target.value?.trimLeft()
    setAddGame(g => ({...g, [field]: value}))
    // remove error if there is a value now
    if (addGameValidation[field]?.length > 0 && value?.length > 0) {
      setAddGameValidation(v => ({...v, [field]: ''}))
    }
  }

  const validateRegisterForm = (): boolean => {
    let valid = true
    if (!addGame.name) {
      setAddGameValidation(v => ({...v, name: 'field is required'}))
      valid = false
    }

    if (!addGame.developer) {
      setAddGameValidation(v => ({...v, developer: 'field is required'}))
      valid = false
    }

    if (!addGame.releaseDate) {
      setAddGameValidation(v => ({...v, releaseDate: 'field is required'}))
      valid = false
    }

    if (addGame.price < 0 || addGame.price > 10000) {
      setAddGameValidation(v => ({...v, price: 'should be between 0 and 10000'}))
      valid = false
    }

    return valid
  }

  const handleAddGame = async () => {
    setAddGameErrorText("")
    if (!validateRegisterForm()) {
      return
    }
    
    const newGame: ICreateGame = {
      ...addGame,
      releaseDate: moment(addGame.releaseDate).format("yyyy-MM-DD"),
      // in fact price is stored in state as a string so we need to double convert it to number
      price: parseInt(addGame.price.toString())
    }
    const [resp, err] = await postData(newGame)
    if (err) {
      if (typeof err === 'string') {
        setAddGameErrorText(err)
        return
      }
      const error = err as IValidationResponse
      setAddGameErrorText(error.fields?.map(f => `${f.field}: ${f.error}`).join("; ") || error.error)
      return
    }
    const game = resp as IGameResponse
    if (game.id) {
      setAddGameDialogText("Game has been successfully added")
      setAddGame({} as ICreateGame)
      setTimeout(() => {
        handleAddGameDialogClose()
        setAddGameDialogText("")
      }, 500)
    } else {
      setAddGameErrorText("An error occured. Try again")
    }
  }

  //#endregion

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
    <LocalizationProvider dateAdapter={DateAdapter}>
      <Layout searchFieldProps={searchFieldProps}>
        <Container maxWidth="xl">
          <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={isLoading}
          >
            <CircularProgress color="inherit" />
          </Backdrop>
          <Dialog open={addGameDialogOpen} onClose={handleAddGameDialogClose} fullWidth={matchesMd}>
            <DialogTitle sx={{textAlign: 'center'}}>Add new game</DialogTitle>
            <DialogContent>
              {addGameDialogText || 
                <Grid container direction="column" alignItems="center">
                  <Grid item sx={{ minWidth: matchesMd ? '400px' : '210px' }}>
                    <TextField
                      required
                      error={!!addGameValidation.name}
                      helperText={addGameValidation.name}
                      fullWidth
                      label="Name"
                      margin="normal"
                      value={addGame?.name || ""}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => handleAddGameFieldChange(e, 'name')}
                    />
                  </Grid>
                  <Grid item sx={{ minWidth: matchesMd ? '400px' : '210px' }}>
                    <TextField
                      required
                      error={!!addGameValidation.developer}
                      helperText={addGameValidation.developer}
                      fullWidth
                      label="Developer"
                      margin="normal"
                      value={addGame?.developer || ""}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => handleAddGameFieldChange(e, 'developer')}
                    />
                  </Grid>
                  <Grid item sx={{ minWidth: matchesMd ? '400px' : '210px' }}>
                    {isTouchDevice()
                    ? <MobileDatePicker
                      label="Release date"
                      inputFormat="yyyy-MM-DD"
                      value={addGame?.releaseDate || null}
                      onChange={(d) => {
                        setAddGameValidation(v => ({...v, releaseDate: ""}));
                        setAddGame(g => ({...g, releaseDate: d || ""}));
                      }}
                      renderInput={(params) => 
                        <TextField {...params} 
                          required 
                          fullWidth
                          error={!!addGameValidation.releaseDate}
                          helperText={addGameValidation.releaseDate} 
                      />}
                    />
                    : <DesktopDatePicker
                      label="Release date"
                      inputFormat="yyyy-MM-DD"
                      value={addGame?.releaseDate || null}
                      onChange={(d) => {
                        setAddGameValidation(v => ({...v, releaseDate: ""}));
                        setAddGame(g => ({...g, releaseDate: d || ""}));
                      }}
                      renderInput={(params) => 
                        <TextField {...params}
                          fullWidth
                          margin="normal"
                          required
                          error={!!addGameValidation.releaseDate}
                          helperText={addGameValidation.releaseDate}
                      />}
                    />
                    }
                  </Grid>
                  <Grid item sx={{ minWidth: matchesMd ? '400px' : '210px' }}>
                    <TextField
                      fullWidth
                      margin="normal"
                      label="Genre"
                      placeholder="rpg,action,adventure"
                      value={addGame?.genre?.join(",") || ""}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => setAddGame(g => ({
                        ...g,
                        genre: e.target.value?.split(",").map(g => g.trim())
                      }))}
                    />
                  </Grid>
                  <Grid item sx={{ minWidth: matchesMd ? '400px' : '210px' }}>
                    <TextField
                      required
                      error={!!addGameValidation.price}
                      helperText={addGameValidation.price}
                        fullWidth
                      margin="normal"
                      label="Price"
                      type="number"
                      value={addGame?.price || 0}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => handleAddGameFieldChange(e, 'price')}
                    />
                  </Grid>
                  {addGameErrorText && 
                    <Grid item sx={{ minWidth: matchesMd ? '400px' : '210px' }}>
                      <Alert severity="error" icon={false}>
                        <Typography>
                          {addGameErrorText}
                        </Typography>
                      </Alert>
                    </Grid>
                  }
                </Grid>
              }
            </DialogContent>
            {!addGameDialogText &&
              <DialogActions>
                <Button size="large" variant="contained" onClick={handleAddGameDialogClose}>Cancel</Button>
                <Button size="large" variant="contained" color="success" onClick={handleAddGame}>Add game</Button>
              </DialogActions>
            }
          </Dialog>

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
            <Grid container spacing={2} direction="row" justifyContent="space-between" alignItems="center" sx={{pb: 3}}>
              <Grid item md={6}>
                <Typography variant="h4">Games</Typography>
              </Grid>
              {hasRole([roles.publisher]) &&
                <Grid item md={6} sx={{textAlign: "right"}}>
                  <Button variant="contained" onClick={() => handleAddGameDialogOpen()}>Add game</Button>
                </Grid>
              }
            </Grid>
            
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
    </LocalizationProvider>
  )
}

export default Landing