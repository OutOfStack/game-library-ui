import React, { useState, useEffect } from 'react'
import { Alert, AlertColor, Backdrop, Box,  Button, CircularProgress, Container, Grid, 
  Snackbar, SnackbarCloseReason, TextField, TextFieldProps, Typography, useMediaQuery, useTheme } from '@mui/material'
import { AdapterMoment as DateAdapter } from '@mui/x-date-pickers/AdapterMoment'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import ToggleButton from '@mui/material/ToggleButton'
import Stack from '@mui/material/Stack'
import Pagination from '@mui/material/Pagination'
import { MobileDatePicker, DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import AbcRoundedIcon from '@mui/icons-material/AbcRounded'
import WhatshotRoundedIcon from '@mui/icons-material/WhatshotRounded'
import DateRangeRoundedIcon from '@mui/icons-material/DateRangeRounded'
import moment from 'moment'
import { FileInfo, Widget as UploadWidget } from "@uploadcare/react-widget"

import Layout from '../components/Layout'
import GameCard from '../components/GameCard'
import { ISearchFieldProps } from '../components/Header'
import { ICountResponse, ICreateGame, IGame, IGameResponse } from '../types/Game'
import useGames from '../hooks/useGames'
import useUser from '../hooks/useUser'
import useAuth from '../hooks/useAuth'
import { IValidationResponse } from '../types/Validation'
import { roles } from '../auth/roles'
import { IGetUserRatingsResponse } from '../types/Rating'
import { isTouchDevice } from '../utils/devices'
import Modal from '../components/Modal'
import '../styles/UploadWidget.css'


const Landing = () => {

  const { fetchPage: fetchGames, fetchCount: fetchGamesCount, create: createGame } = useGames()
  const { fetchRatings } = useUser()
  const { hasRole, isAuthenticated } = useAuth()
  const theme = useTheme()
  const matchesMd = useMediaQuery(theme.breakpoints.up('md'))
  const matchesSm = useMediaQuery(theme.breakpoints.only('sm'))
  const matchesXs = useMediaQuery(theme.breakpoints.only('xs'))
  
  const defaultPagination = {
    pageSize: 24,
    page: 1,
    orderBy: "default",
    searchText: ""
  }
  
  const [data, setData] = useState<IGame[]>([])
  const [count, setCount] = useState<number>(0)
  const [userRatings, setUserRatings] = useState<IGetUserRatingsResponse>({})
  const [isLoading, setIsLoading] = useState(false)
  const [pagination, setPagination] = useState(defaultPagination)

  //#region notification

  const defaultAlert = {
    open: false,
    message: "",
    severity: "success" as AlertColor
  }
  const [alert, setAlert] = useState(defaultAlert)

  const handleCloseAlert = (event?: Event | React.SyntheticEvent<any, Event>, reason?: SnackbarCloseReason) => {
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


  //#region sorting
  const handleSorting = (event: React.MouseEvent<HTMLElement>, orderBy: string | null) => {
    if (orderBy) {
      setPagination(p => ({
        ...p,
        page: defaultPagination.page,
        orderBy: orderBy
      }))
    }
  }

  //#endregion

  //#region add game

  interface IAddGameValidation {
    name: string,
	  developer: string,
	  releaseDate: string,
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
  })

  const handleAddGameDialogOpen = () => setAddGameDialogOpen(true)
  const handleAddGameDialogClose = () => setAddGameDialogOpen(false)
  
  const handleAddGameFieldChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, field: string) => {
    const value = e.target.value?.trimStart()
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
    } else if (!moment(addGame.releaseDate).isValid()) {
      setAddGameValidation(v => ({...v, releaseDate: 'invalid date or format. should be YYYY-MM-DD'}))
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
      releaseDate: moment(addGame.releaseDate).format("yyyy-MM-DD")
    }
    const [resp, err] = await createGame(newGame)
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

  //#region upload widget

  const handleLogoChanged = (fileInfo: FileInfo) => {
    if (fileInfo.isStored) {
      setAddGame(g => ({...g, logoUrl: fileInfo.cdnUrl || undefined}))
    }
  }

  const fileSizeLimit = (sizeInKb: number) => {
    return function(fileInfo: FileInfo) {
      if (fileInfo.name === null || fileInfo.size === null) {
        return
      }
  
      if (fileInfo.size > sizeInKb * 1024) {
        throw new Error('size')
      }
    }
  }

  const hasExtension = () => {
    return function(fileInfo: FileInfo) {
      if (fileInfo.name === null) {
        return
      }
  
      if (!fileInfo.name.includes(".")) {
        throw new Error('image')
      }
    }
  }
  
  const uploadValidators = [fileSizeLimit(150), hasExtension()]

  //#endregion

  const handleSearchTextChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setPagination(p => ({
      ...p,
      page: defaultPagination.page,
      searchText: e.target.value,
    }))
  }

  const handlePagination = (page: number = defaultPagination.page) => {
    setPagination(p => ({
      ...p,
      page: page
    }))
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

  // fetch games with pagination when page, order by or search text changes
  useEffect(() => {
    const getData = async () => {
      setIsLoading(true)
      const [resp, err] = await fetchGames(pagination.pageSize, pagination.page, pagination.orderBy, pagination.searchText)
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
      if (games.length > 0) {
        setData(games)
      }
      setIsLoading(false)
    }
    getData()
  }, [pagination.page, pagination.orderBy, pagination.searchText])

    // fetch games count
    useEffect(() => {
      const getCount = async () => {
        const [resp, err] = await fetchGamesCount(pagination.searchText)
        if (err) {
          if (typeof err === 'string') {
            showNotification(err, "error")
          } else {
            const error = err as IValidationResponse
            showNotification(error.fields?.map(f => `${f.field}: ${f.error}`).join("; ") || error.error, "error")
          }
          return
        }
        const r = resp as ICountResponse
        setCount(r.count)
      }
      getCount()
    }, [pagination.searchText])

  const searchFieldProps: ISearchFieldProps = {
    text: pagination.searchText,
    changeText: handleSearchTextChange
  }

  return (
    <LocalizationProvider dateAdapter={DateAdapter}>
      <Layout searchFieldProps={searchFieldProps}>
        <Container maxWidth="xl" disableGutters={true}>
          <Backdrop
            sx={{ color: '#fff', zIndex: (theme: any) => theme.zIndex.drawer + 1 }}
            open={isLoading}
          >
            <CircularProgress color="inherit" />
          </Backdrop>

          <Modal 
            fullwidth={matchesMd}
            matchesMd={matchesMd}
            isOpen={addGameDialogOpen} 
            closeDialog={handleAddGameDialogClose} 
            title='Add new game' 
            dialogText={addGameDialogText} 
            dialogErrorText={addGameErrorText} 
            submitActionName='Add game' 
            // TODO: Uncomment
            //handleSubmit={handleAddGame}
            handleSubmit={() => {}}
          >
            <>
              <Grid item sx={{ minWidth: matchesMd ? '400px' : '210px' }}>
                <div style={{color: "red", textAlign: "center"}}>TEMPORARILY DISABLED</div>
              </Grid>
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
                  onChange={(d: string | null) => {
                    setAddGameValidation(v => ({...v, releaseDate: ""}));
                    setAddGame(g => ({...g, releaseDate: d || ""}));
                  }}
                  mask="____-__-__"
                  renderInput={(params: TextFieldProps) => 
                    <TextField {...params} 
                      fullWidth
                      margin="normal"
                      required 
                      error={!!addGameValidation.releaseDate}
                      helperText={addGameValidation.releaseDate} 
                  />}
                />
                : <DesktopDatePicker
                  label="Release date"
                  inputFormat="yyyy-MM-DD"
                  value={addGame?.releaseDate || null}
                  onChange={(d: string | null) => {
                    setAddGameValidation(v => ({...v, releaseDate: ""}));
                    setAddGame(g => ({...g, releaseDate: d || ""}));
                  }}
                  mask="____-__-__"
                  renderInput={(params: TextFieldProps) => 
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
                <label style={{color: "rgba(0, 0, 0, 0.6)"}} htmlFor={'uploadWidget'}>Logo </label>
                <Typography variant="caption" color={"rgba(0, 0, 0, 0.6)"}> (max size 150 kb, recommended ratio 2:1)</Typography>
                <div id={'uploadWidget'}>
                  <UploadWidget
                    imagesOnly
                    previewStep={true}
                    tabs='file'
                    publicKey='8869032692db5708aebb' 
                    validators={uploadValidators}
                    onChange={(fileInfo: FileInfo) => handleLogoChanged(fileInfo)}
                  />
                </div>
              </Grid>
            </>
          </Modal>

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
              <Grid item xs={3} sx={{pt: 0}}>
                <ToggleButtonGroup
                  value={pagination.orderBy}
                  size="small"
                  exclusive
                  onChange={handleSorting}
                  aria-label="sorting"
                >
                  <ToggleButton value="default" aria-label="default" title="Ranking">
                    <WhatshotRoundedIcon fontSize={matchesXs ? "small" : "medium"} />
                  </ToggleButton>
                  <ToggleButton value="name" aria-label="name" title="Name">
                    <AbcRoundedIcon fontSize={matchesXs ? "small" : "medium"} />
                  </ToggleButton>
                  <ToggleButton value="releaseDate" aria-label="release date" title="Release date">
                    <DateRangeRoundedIcon fontSize={matchesXs ? "small" : "medium"} />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Grid>
              <Grid item sm={6} sx={{textAlign: "center"}}>
                <Typography variant={matchesXs ? "h6" : "h5"}>Games</Typography>
              </Grid>
              <Grid item xs={3} sx={{textAlign: "right"}}>
                {hasRole([roles.publisher]) 
                  ? <Button variant="contained" onClick={() => handleAddGameDialogOpen()}>Add game</Button>
                  : <Box sx={{width: "25w"}}/>
                }
              </Grid>
            </Grid>
            
            <Grid container spacing={2}>
              {data.map((game: IGame) => (
                <Grid key={game.id} item xs={6} sm={4} md={3} lg={2}>
                  <GameCard game={game} showUserRating={isAuthenticated && hasRole([roles.user])} userRating={userRatings[game.id?.toString()]}/>
                </Grid>
              ))}
            </Grid>
            <Stack sx={{alignItems: 'center', pt: 3}}>
              <Pagination
                defaultPage={defaultPagination.page}
                hidePrevButton={pagination.page === defaultPagination.page} 
                hideNextButton={pagination.page === Math.ceil(count / pagination.pageSize)}
                siblingCount={0}
                count={Math.ceil(count/pagination.pageSize)}
                page={pagination.page}
                variant="outlined" 
                shape="rounded"
                size="large"
                onChange={(_, page) => handlePagination(page)}
              />
            </Stack>
          </Box>
        </Container>
      </Layout>
    </LocalizationProvider>
  )
}

export default Landing