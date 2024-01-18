import React, { useState, useEffect } from 'react'
import {
  Alert, AlertColor, Autocomplete, AutocompleteChangeReason, AutocompleteChangeDetails, Backdrop, Box, Button, 
  CircularProgress, Container, Grid, Pagination, Snackbar, SnackbarCloseReason, Stack, TextField, TextFieldProps, 
  Typography, ToggleButton, ToggleButtonGroup, useMediaQuery, useTheme
} from '@mui/material'
import { AdapterMoment as DateAdapter } from '@mui/x-date-pickers/AdapterMoment'
import { MobileDatePicker, DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import AbcIcon from '@mui/icons-material/AbcRounded'
import WhatshotIcon from '@mui/icons-material/WhatshotRounded'
import DateRangeIcon from '@mui/icons-material/DateRangeRounded'
import moment from 'moment'
import { FileInfo, FileUpload, FilesUpload, Widget as UploadWidget } from '@uploadcare/react-widget'
import { useSearchParams } from 'react-router-dom'

import Layout from '../components/Layout'
import GameCard from '../components/GameCard'
import GameDetails from '../components/GameDetails'
import { IDarkModeProps, ISearchFieldProps } from '../components/Header'
import { ICountResponse, ICreateGame, IGame, IGameResponse, IPlatform, IGenre } from '../types/Game'
import useGames from '../hooks/useGames'
import useGenres from '../hooks/useGenres'
import usePlatforms from '../hooks/usePlatforms'
import useUser from '../hooks/useUser'
import useAuth from '../hooks/useAuth'
import { IValidationResponse } from '../types/Validation'
import { roles } from '../auth/roles'
import { IGetUserRatingsResponse } from '../types/Rating'
import { isTouchDevice } from '../utils/devices'
import Modal from '../components/Modal'
import '../styles/UploadWidget.css'

const fieldWidthLarge = '400px'
const fieldWidthSmall = '210px'

interface ILandingProps {
  darkModeProps: IDarkModeProps
}

const Landing = (props: ILandingProps) => {
  const { darkModeProps } = props

  const { fetchPage: fetchGames, fetchCount: fetchGamesCount, create: createGame } = useGames()
  const { fetchRatings } = useUser()
  const { fetchGenres } = useGenres()
  const { fetchPlatforms } = usePlatforms()
  const { hasRole, isAuthenticated } = useAuth()
  const theme = useTheme()
  const matchesMd = useMediaQuery(theme.breakpoints.up('md'))
  const matchesSm = useMediaQuery(theme.breakpoints.only('sm'))
  const matchesXs = useMediaQuery(theme.breakpoints.only('xs'))

  const [data, setData] = useState<IGame[]>([])
  const [count, setCount] = useState<number>(0)
  const [userRatings, setUserRatings] = useState<IGetUserRatingsResponse>({})
  const [genres, setGenres] = useState<IGenre[]>([])
  const [platforms, setPlatforms] = useState<IPlatform[]>([])
  const [isLoading, setIsLoading] = useState(false)

  //#region navigation

  const minSearchTextLength = 2
  const defaultOrderBy = "default"
  const pageParam = "page"
  const orderByParam = "orderBy"
  const searchTextParam = "search"
  const defaultNavigation = {
    pageSize: 24,
    page: 1,
    orderBy: defaultOrderBy,
    searchText: ""
  }

  let [searchParams, setSearchParams] = useSearchParams()
  const [navigation, setNavigation] = useState(() => {
    const pageSize = defaultNavigation.pageSize
    const pageP = parseInt(searchParams.get(pageParam) || "")
    const page = pageP >= defaultNavigation.page
      ? pageP
      : defaultNavigation.page
    const orderByP = searchParams.get(orderByParam) || ""
    const orderBy = orderByP && orderByP !== defaultOrderBy
      ? orderByP
      : defaultNavigation.orderBy
    const searchTextP = searchParams.get(searchTextParam) || ""
    const searchText = searchTextP.length >= minSearchTextLength
      ? searchTextP
      : defaultNavigation.searchText

    return {
      pageSize: pageSize,
      page: page,
      orderBy: orderBy,
      searchText: searchText,
    }
  })

  const pagesCount = (count: number) => Math.ceil(count / navigation.pageSize)

  //#endregion

  //#region game details modal
  const [selectedGame, setSelectedGame] = useState<IGame | null>(null)
  const [gameDetailsOpen, setGameDetailsOpen] = useState<boolean>(false)

  const handleCloseGameDetails = () => {
    setGameDetailsOpen(false)
    setSelectedGame(null)
  }

  const handleOpenGameDetails = (game: IGame) => {
    setSelectedGame(game)
    setGameDetailsOpen(true)
  }

  //#endregion

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
    setAlert(a => ({ ...defaultAlert, severity: a.severity }))
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
      setNavigation(p => ({
        ...p,
        page: defaultNavigation.page,
        orderBy: orderBy
      }))
      setSearchParams(p => {
        p.delete(pageParam)
        if (orderBy === defaultOrderBy) {
          p.delete(orderByParam)
        } else {
          p.set(orderByParam, orderBy)
        }
        return p
      })
    }
  }

  //#endregion

  //#region add game

  interface IAddGameValidation {
    name: string,
    developer: string,
    releaseDate: string,
    summary: string,
    genres: string,
    platforms: string,
    logo: string,
    screenshots: string,
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
    summary: "",
    genres: "",
    platforms: "",
    logo: "",
    screenshots: "",
  })

  const handleAddGameDialogOpen = () => setAddGameDialogOpen(true)
  const handleAddGameDialogClose = () => setAddGameDialogOpen(false)

  const handleAddGameFieldChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, field: string) => {
    const value = e.target.value?.trimStart()
    setAddGame(g => ({ ...g, [field]: value }))
    // remove error if there is a value now
    if (addGameValidation[field]?.length > 0 && value?.length > 0) {
      setAddGameValidation(v => ({ ...v, [field]: '' }))
    }
  }

  const validateAddGameForm = (): boolean => {
    let valid = true
    if (!addGame.name) {
      setAddGameValidation(v => ({ ...v, name: 'Name is required' }))
      valid = false
    }

    if (!addGame.developer) {
      setAddGameValidation(v => ({ ...v, developer: 'Developer is required' }))
      valid = false
    }

    if (!addGame.releaseDate) {
      setAddGameValidation(v => ({ ...v, releaseDate: 'Release date is required' }))
      valid = false
    } else if (!moment(addGame.releaseDate).isValid()) {
      setAddGameValidation(v => ({ ...v, releaseDate: 'Invalid date or format. Should be YYYY-MM-DD' }))
      valid = false
    }

    if (!addGame.summary) {
      setAddGameValidation(v => ({ ...v, summary: 'Summary is required' }))
      valid = false
    }

    if (!addGame.genresIds?.length) {
      setAddGameValidation(v => ({ ...v, genres: 'At least one genre is required' }))
      valid = false
    }

    if (!addGame.platformsIds?.length) {
      setAddGameValidation(v => ({ ...v, platforms: 'At least one platform is required' }))
      valid = false
    }

    if (!addGame.logoUrl) {
      setAddGameValidation(v => ({ ...v, logo: 'Cover is required' }))
      valid = false
    }

    if (!addGame.screenshots?.length) {
      setAddGameValidation(v => ({ ...v, screenshots: 'Screenshots are required' }))
      valid = false
    }

    return valid
  }

  const handleAddGame = async () => {
    setAddGameErrorText("")
    if (!validateAddGameForm()) {
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
      setAddGameErrorText("An error occured. Try again later")
    }
  }

  //#endregion

  //#region upload widget

  const handleLogoChanged = (fileInfo: FileInfo) => {
    if (fileInfo.isStored) {
      setAddGame(g => ({ ...g, logoUrl: fileInfo.cdnUrl || undefined }))
    }

    if (addGameValidation.logo.length > 0 && fileInfo.cdnUrl) {
      setAddGameValidation(v => ({ ...v, logo: '' }))
    }
  }

  const handleScreenshotsChanged = async (fileInfo: FileUpload | FilesUpload | null) => {
    if (!fileInfo) {
      return
    }
    let group = fileInfo as FilesUpload
    const files = await Promise.all(group.files())
    const urls = files.map((file) => file?.cdnUrl || '')
    
    setAddGame(g => ({ ...g, screenshots: urls }))

    if (addGameValidation.screenshots.length > 0 && urls?.length > 0) {
      setAddGameValidation(v => ({ ...v, screenshots: '' }))
    }
  }

  const fileSizeLimit = (sizeInKb: number) => {
    return (fileInfo: FileInfo) => {
      if (fileInfo.name === null || fileInfo.size === null) {
        return
      }

      if (fileInfo.size > sizeInKb * 1024) {
        throw new Error('size')
      }
    }
  }

  const hasExtension = () => {
    return (fileInfo: FileInfo) => {
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
    const text = e.target.value
    setNavigation(p => ({
      ...p,
      page: text.length >= minSearchTextLength ? defaultNavigation.page : p.page,
      searchText: text
    }))
    setSearchParams(p => {
      p.delete(pageParam)
      if (text.length >= minSearchTextLength) {
        p.set(searchTextParam, text)
      } else {
        p.delete(searchTextParam)
      }
      return p
    })
  }

  const handleNavigation = (page: number = defaultNavigation.page) => {
    setNavigation(p => ({
      ...p,
      page: page
    }))
    setSearchParams(p => {
      p.set(pageParam, page.toString())
      return p
    })
  }

  const notifyError = (err: string | IValidationResponse | null) => {
    if (typeof err === 'string') {
      showNotification(err, "error")
    } else {
      const error = err as IValidationResponse
      showNotification(error.fields?.map(f => `${f.field}: ${f.error}`).join("; ") || error.error, "error")
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
        notifyError(err)
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
      const [resp, err] = await fetchGames(navigation.pageSize, navigation.page, navigation.orderBy, navigation.searchText)
      if (err) {
        notifyError(err)
        setIsLoading(false)
        return
      }
      const games = resp as IGame[]
      setData(games)
      setIsLoading(false)
    }
    getData()
  }, [navigation.page, navigation.orderBy, navigation.searchText])

  // fetch games count
  useEffect(() => {
    const getCount = async () => {
      const [resp, err] = await fetchGamesCount(navigation.searchText)
      if (err) {
        notifyError(err)
        return
      }
      const r = resp as ICountResponse
      setCount(r.count)

      if (navigation.searchText.length >= minSearchTextLength && navigation.page > pagesCount(r.count)) {
        setNavigation(p => ({
          ...p,
          page: defaultNavigation.page
        }))
        setSearchParams(p => {
          p.delete(pageParam)
          return p
        })
      }
    }
    getCount()
  }, [navigation.searchText])

  // fetch genres
  useEffect(() => {
    const getGenres = async () => {
      const [resp, err] = await fetchGenres()
      if (err) {
        notifyError(err)
        return
      }
      const genres = resp as IGenre[]
      console.log(genres)
      setGenres(genres)
    }
    getGenres()
  }, [])

  // fetch platforms
  useEffect(() => {
    const getPlatforms = async () => {
      const [resp, err] = await fetchPlatforms()
      if (err) {
        notifyError(err)
        return
      }
      const platforms = resp as IPlatform[]
      console.log(platforms)
      setPlatforms(platforms)
    }
    getPlatforms()
  }, [])

  const searchFieldProps: ISearchFieldProps = {
    text: navigation.searchText,
    changeText: handleSearchTextChange
  }

  const uwpk = '8869032692db5708aebb'

  return (
    <LocalizationProvider dateAdapter={DateAdapter}>
      <Layout searchFieldProps={searchFieldProps} darkModeProps={darkModeProps}>
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
            handleSubmit={handleAddGame}
          >
            <>
              <Grid item sx={{ minWidth: matchesMd ? fieldWidthLarge : fieldWidthSmall }}>
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
              <Grid item sx={{ minWidth: matchesMd ? fieldWidthLarge : fieldWidthSmall }}>
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
              <Grid item sx={{ minWidth: matchesMd ? fieldWidthLarge : fieldWidthSmall }}>
                {isTouchDevice()
                  ? <MobileDatePicker
                    label="Release date"
                    inputFormat="yyyy-MM-DD"
                    value={addGame?.releaseDate || null}
                    onChange={(d: string | null) => {
                      setAddGameValidation(v => ({ ...v, releaseDate: "" }))
                      setAddGame(g => ({ ...g, releaseDate: d || "" }))
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
                      setAddGameValidation(v => ({ ...v, releaseDate: "" }))
                      setAddGame(g => ({ ...g, releaseDate: d || "" }))
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
              <Grid item sx={{ minWidth: matchesMd ? fieldWidthLarge : fieldWidthSmall }}>
                <TextField
                  required
                  error={!!addGameValidation.summary}
                  helperText={addGameValidation.summary}
                  fullWidth
                  multiline
                  margin="normal"
                  label="Summary"
                  value={addGame?.summary || ""}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => handleAddGameFieldChange(e, "summary")}
                />
              </Grid>
              <Grid item sx={{ minWidth: matchesMd ? fieldWidthLarge : fieldWidthSmall }}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Websites"
                  placeholder="mygame.com,twitch.com/mygame"
                  value={addGame?.websites?.join(",") || ""}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => setAddGame(g => ({
                    ...g,
                    websites: e.target.value?.split(",").map(g => g.trim())
                  }))}
                />
              </Grid>
              <Grid item sx={{ minWidth: matchesMd ? fieldWidthLarge : fieldWidthSmall }}>
              <Autocomplete
                multiple
                disableCloseOnSelect
                filterSelectedOptions
                id="genres"
                options={genres}
                getOptionLabel={(option: IGenre) => option.name}
                onChange={(e: React.SyntheticEvent, value: IGenre[], reason: AutocompleteChangeReason, details?: AutocompleteChangeDetails<IGenre> | undefined) => {
                  setAddGame(g => ({
                    ...g,
                    genresIds: value?.map(g => g.id)
                  }))

                  if (addGameValidation.genres?.length !== 0 && value?.length > 0) {
                    setAddGameValidation(v => ({ ...v, genres: '' }))
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    fullWidth
                    error={!!addGameValidation.genres}
                    helperText={addGameValidation.genres}
                    margin="normal"
                    label="Genres"
                  />
                )}
              />
              <Autocomplete
                multiple
                disableCloseOnSelect
                filterSelectedOptions
                id="platforms"
                options={platforms}
                getOptionLabel={(option: IPlatform) => option.name}
                onChange={(e: React.SyntheticEvent, value: IPlatform[], reason: AutocompleteChangeReason, details?: AutocompleteChangeDetails<IPlatform> | undefined) => {
                  setAddGame(g => ({
                    ...g,
                    platformsIds: value?.map(p => p.id)
                  }))

                  if (addGameValidation.platforms?.length !== 0 && value?.length > 0) {
                    setAddGameValidation(v => ({ ...v, platforms: '' }))
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    fullWidth
                    error={!!addGameValidation.platforms}
                    helperText={addGameValidation.platforms}
                    margin="normal"
                    label="Platforms"
                  />
                )}
              />
              </Grid>
              <Grid item sx={{ minWidth: matchesMd ? fieldWidthLarge : fieldWidthSmall }}>
                <label htmlFor={'coverUploadWidget'}>Cover </label>
                <Typography variant="caption" color={"rgba(200, 150, 100, 0.8)"}> (max size 150 kb, ratio 3:4)</Typography>
                <div id={'coverUploadWidget'}>
                  <UploadWidget
                    imagesOnly
                    previewStep
                    clearable
                    crop='3:4'
                    tabs='file'
                    publicKey={uwpk}
                    validators={uploadValidators}
                    onChange={(fileInfo: FileInfo) => handleLogoChanged(fileInfo)}
                  />
                </div>
                <Typography variant="caption" color="#f44336">  {addGameValidation.logo}</Typography>
              </Grid>
              <Grid item sx={{ minWidth: matchesMd ? fieldWidthLarge : fieldWidthSmall }}>
                <label htmlFor={'screenshotsUploadWidget'}>Screenshots </label>
                <Typography variant="caption" color={"rgba(200, 150, 100, 0.8)"}> (max size 150 kb, ratio 9:5, max 7 images)</Typography>
                <div id={'screenshotsUploadWidget'}>
                  <UploadWidget
                    imagesOnly
                    multiple
                    previewStep
                    clearable
                    crop='9:5'
                    multipleMax={7}
                    tabs='file'
                    publicKey={uwpk}
                    validators={uploadValidators}
                    onFileSelect={(fileInfo: FileUpload | FilesUpload | null) => handleScreenshotsChanged(fileInfo)}
                  />
                </div>
                <Typography variant="caption" color="#f44336">  {addGameValidation.screenshots}</Typography>
              </Grid>
            </>
          </Modal>

          <Snackbar
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={alert.open}
            autoHideDuration={5000}
            onClose={handleCloseAlert}
          >
            <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }} >
              {alert.message}
            </Alert>
          </Snackbar>

          <Box sx={{ pb: 3 }}>
            <Grid container spacing={2} direction="row" justifyContent="space-between" alignItems="center" sx={{ pb: 3 }}>
              <Grid item xs={3} sx={{ pt: 0 }}>
                <ToggleButtonGroup
                  value={navigation.orderBy}
                  size="small"
                  exclusive
                  onChange={handleSorting}
                  aria-label="sorting"
                >
                  <ToggleButton value="default" aria-label="default" title="Ranking">
                    <WhatshotIcon fontSize={matchesXs ? "small" : "medium"} />
                  </ToggleButton>
                  <ToggleButton value="releaseDate" aria-label="release date" title="Release date">
                    <DateRangeIcon fontSize={matchesXs ? "small" : "medium"} />
                  </ToggleButton>
                  <ToggleButton value="name" aria-label="name" title="Name">
                    <AbcIcon fontSize={matchesXs ? "small" : "medium"} />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Grid>
              <Grid item sm={6} sx={{ textAlign: "center" }}>
                <Typography variant={matchesXs ? "h6" : "h5"}>
                  Games <sup style={{ fontSize: matchesXs ? 9 : 11, color: "" }}> {count}</sup>
                </Typography>
              </Grid>
              <Grid item xs={3} sx={{ textAlign: "right" }}>
                {hasRole([roles.publisher])
                  ? <Button variant="contained" onClick={() => handleAddGameDialogOpen()}>Add game</Button>
                  : <Box sx={{ width: "25w" }} />
                }
              </Grid>
            </Grid>

            <GameDetails
              game={selectedGame}
              showUserRating={isAuthenticated && hasRole([roles.user])}
              userRating={userRatings[selectedGame?.id?.toString() || ""]}
              open={gameDetailsOpen}
              handleClose={handleCloseGameDetails}
            />

            <Grid container spacing={2}>
              {data.map((game: IGame) => (
                <Grid key={game.id} item xs={6} sm={4} md={3} lg={2}>
                  <GameCard
                    game={game}
                    handleOpenDetails={handleOpenGameDetails}
                    darkMode={darkModeProps.darkMode}
                  />
                </Grid>
              ))}
            </Grid>
            <Stack sx={{ alignItems: 'center', pt: 3 }}>
              <Pagination
                defaultPage={defaultNavigation.page}
                hidePrevButton={navigation.page === defaultNavigation.page}
                hideNextButton={navigation.page >= pagesCount(count)}
                siblingCount={0}
                count={pagesCount(count)}
                page={navigation.page}
                variant="outlined"
                shape="rounded"
                size="large"
                onChange={(_, page) => handleNavigation(page)}
              />
            </Stack>
          </Box>
        </Container>
      </Layout>
    </LocalizationProvider>
  )
}

export default Landing