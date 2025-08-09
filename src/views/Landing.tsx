import React, { useState, useEffect } from 'react'
import {
  Backdrop, Box, Button, CircularProgress, Container, Grid, Pagination, Stack, Typography, 
  ToggleButton, ToggleButtonGroup, useMediaQuery, useTheme, Chip, ListItem, List, ListItemText, ListItemButton
} from '@mui/material'
import { AdapterMoment as DateAdapter } from '@mui/x-date-pickers/AdapterMoment'
import { LocalizationProvider } from '@mui/x-date-pickers'
import AbcIcon from '@mui/icons-material/AbcRounded'
import WhatshotIcon from '@mui/icons-material/WhatshotRounded'
import DateRangeIcon from '@mui/icons-material/DateRangeRounded'
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import KeyboardArrowUpOutlinedIcon from '@mui/icons-material/KeyboardArrowUpOutlined'
import { useSearchParams } from 'react-router'

import Layout from '../components/Layout'
import GameCard from '../components/GameCard'
import GameDetails from '../components/GameDetails'
import AddGameModal from '../components/AddGameModal'
import Notification from '../components/Notification'
import { IDarkModeProps, ISearchFieldProps } from '../components/Header'
import { IGame, IGames, IGamesFilter } from '../types/Game'
import { IGenre } from '../types/Genre'
import { ICompany } from '../types/Company'
import { IValidationResponse } from '../types/Validation'
import { IGetUserRatingsResponse } from '../types/Rating'
import { roles } from '../types/Auth/User'
import useGames from '../hooks/useGames'
import useGenres from '../hooks/useGenres'
import useCompanies from '../hooks/useCompanies'
import useUser from '../hooks/useUser'
import useAuth from '../hooks/useAuth'


const topCategoriesLimit = 8
const selectedCategoryColor = "#1ea0c0"

interface ILandingProps {
  darkModeProps: IDarkModeProps
}

const Landing = (props: ILandingProps) => {
  const { darkModeProps } = props

  const { fetchPage: fetchGames } = useGames()
  const { fetchRatings } = useUser()
  const { fetchTopGenres } = useGenres()
  const { fetchTopCompanies } = useCompanies()
  const { hasRole, isAuthenticated } = useAuth()

  const theme = useTheme()
  const matchesSm = useMediaQuery(theme.breakpoints.only('sm'))
  const matchesXs = useMediaQuery(theme.breakpoints.only('xs'))

  const [data, setData] = useState<IGame[]>([])
  const [count, setCount] = useState<number>(0)
  const [userRatings, setUserRatings] = useState<IGetUserRatingsResponse>({})
  const [topGenres, setTopGenres] = useState<IGenre[]>([])
  const [topDevelopers, setTopDevelopers] = useState<ICompany[]>([])
  const [topPublishers, setTopPublishers] = useState<ICompany[]>([])
  const [topCategoriesOpen, setTopCategoriesOpen] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState(false)

  const [alert, setAlert] = useState<string | IValidationResponse | null>(null)
  
  const mediaQueryToSize = (): "small" | "medium" | "large" => {
    return matchesXs ? "small" : matchesSm ? "medium" : "large"
  }

  const mediaQueryToTextSize = (): "small" | "medium" | "large" => {
    return matchesXs ? "small" :"medium"
  }

  //#region navigation

  const minSearchTextLength = 2
  const defaultOrderBy = "default"
  const pageParam = "page"
  const orderByParam = "orderBy"
  const searchTextParam = "search"
  const genreParam = "genre"
  const developerParam = "developer"
  const publisherParam = "publisher"
  const defaultNavigation = {
    pageSize: 24,
    page: 1,
    orderBy: defaultOrderBy,
    searchText: "",
    genre: 0,
    developer: 0,
    publisher: 0 
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
    const genreP = parseInt(searchParams.get(genreParam) || "")
    const genre = genreP || defaultNavigation.genre
    const developerP = parseInt(searchParams.get(developerParam) || "")
    const developer = developerP || defaultNavigation.developer
    const publisherP = parseInt(searchParams.get(publisherParam) || "")
    const publisher = publisherP || defaultNavigation.publisher

    return {
      pageSize: pageSize,
      page: page,
      orderBy: orderBy,
      searchText: searchText,
      genre: genre,
      developer: developer,
      publisher: publisher,
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

  const [addGameDialogOpen, setAddGameDialogOpen] = useState(false)

  const handleAddGameDialogOpen = () => setAddGameDialogOpen(true)
  const handleAddGameDialogClose = () => setAddGameDialogOpen(false)

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

  const handleCategoryChange = (type: "genre" | "publisher" | "developer", id: number) => {
    if (id) {
      if (id === navigation[type]) {
        id = 0
      }
      setNavigation(p => ({
        ...p,
        page: defaultNavigation.page,
        [type]: id
      }))
    }
    setSearchParams(p => {
      p.delete(pageParam)
      if (id && id !== navigation[type]) {
        p.set(type, id.toString())
      } else {
        p.delete(type)
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

  // get user ratings
  useEffect(() => {
    const getRatings = async () => {
      setIsLoading(true)
      const gameIds = data.map(d => d.id)
      const [resp, err] = await fetchRatings({
        gameIds: gameIds
      })
      if (err) {
        setAlert(err)
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
      let filter = {
        orderBy: navigation.orderBy, 
        name: navigation.searchText,
        genre: navigation.genre,
        developer: navigation.developer,
        publisher: navigation.publisher
      } as IGamesFilter
      const [resp, err] = await fetchGames(filter, navigation.pageSize, navigation.page)
      if (err) {
        setAlert(err)
        setIsLoading(false)
        return
      }
      const gamesResp = resp as IGames
      setData(gamesResp.games)               

      setCount(gamesResp.count)
      if (navigation.page > pagesCount(gamesResp.count)) {
        setNavigation(p => ({
          ...p,
          page: defaultNavigation.page
        }))
        setSearchParams(p => {
          p.delete(pageParam)
          return p
        })
      }

      setIsLoading(false)
    }
    getData()
  }, [navigation.page, navigation.orderBy, navigation.searchText, navigation.genre, navigation.developer, navigation.publisher])

  // fetch top genres
  useEffect(() => {
    const getTopGenres = async () => {
      const [resp, err] = await fetchTopGenres()
      if (err) {
        setAlert(err)
        return
      }
      const genres = resp as IGenre[]
      setTopGenres(genres.slice(0, topCategoriesLimit))
    }
    getTopGenres()
  }, [])

  // fetch top developers
  useEffect(() => {
    const getTopDevelopers = async () => {
      const [resp, err] = await fetchTopCompanies("dev")
      if (err) {
        setAlert(err)
        return
      }
      const developers = resp as ICompany[]
      setTopDevelopers(developers.slice(0, topCategoriesLimit))
    }
    getTopDevelopers()
  }, [])

  // fetch top publishers
  useEffect(() => {
    const getTopPublishers = async () => {
      const [resp, err] = await fetchTopCompanies("pub")
      if (err) {
        setAlert(err)
        return
      }
      const publishers = resp as ICompany[]
      setTopPublishers(publishers.slice(0, topCategoriesLimit))
    }
    getTopPublishers()
  }, [])

  const searchFieldProps: ISearchFieldProps = {
    text: navigation.searchText,
    changeText: handleSearchTextChange
  }

  const categoryApplied = (): boolean => {
    return !!navigation.genre || !!navigation.developer || !!navigation.publisher
  }

  return (
    <LocalizationProvider dateAdapter={DateAdapter}>
      <Layout searchFieldProps={searchFieldProps} darkModeProps={darkModeProps}>
          <Backdrop
            sx={theme => ({
              color: '#fff',
              zIndex: theme.zIndex.drawer + 1
            })}
            open={isLoading}
          >
            <CircularProgress color="inherit" />
          </Backdrop>

          <AddGameModal
            handleAddGameDialogClose={handleAddGameDialogClose}
            addGameDialogOpen={addGameDialogOpen}
          />

          <Notification 
            message={alert} 
            resetMessage={() => setAlert(null)}
          />

          <Box sx={{ pb: 3 }}>
            {hasRole([roles.publisher]) &&
              <Grid container direction="row" sx={{ justifyContent: "space-between", alignItems: "left", pb: 2 }}>
                <Grid size={{ xs: 9 }}>
                  <Box />
                </Grid>
                <Grid sx={{ textAlign: "right" }} size={{ xs: 3 }}>
                  <Button variant="contained" size={mediaQueryToSize()} onClick={() => handleAddGameDialogOpen()}>ADD GAME</Button>
                </Grid>
              </Grid>
            }
            <Grid container spacing={matchesXs ? 0.5 : 2} direction="row" sx={{ justifyContent: "space-between", alignItems: "center", pb: topCategoriesOpen ? 0.5 : 3 }}>
              <Grid sx={{ pt: 0 }} size={{ xs: 4 }}>
                <ToggleButtonGroup
                  value={navigation.orderBy}
                  size="small"
                  exclusive
                  onChange={handleSorting}
                  aria-label="sorting"
                >
                  <ToggleButton value="default" aria-label="default" title="Ranking">
                    <WhatshotIcon fontSize={mediaQueryToTextSize()} />
                  </ToggleButton>
                  <ToggleButton value="releaseDate" aria-label="release date" title="Release date">
                    <DateRangeIcon fontSize={mediaQueryToTextSize()} />
                  </ToggleButton>
                  <ToggleButton value="name" aria-label="name" title="Name">
                    <AbcIcon fontSize={mediaQueryToTextSize()} />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Grid>
              <Grid sx={{ textAlign: "center" }} size={{ xs: 4 }}>
                <Typography variant={matchesXs ? "h6" : "h5"}>
                  Games <sup style={{ fontSize: matchesXs ? 9 : 11, color: "" }}> {count}</sup>
                </Typography>
              </Grid>
              <Grid sx={{ textAlign: "right" }} size={{ xs: 4} }>
                <ToggleButton
                  value="check"
                  selected={topCategoriesOpen}
                  onChange={() => {setTopCategoriesOpen(v => !v) }}
                  size="small"
                  title="Categories"
                >
                  <CategoryOutlinedIcon fontSize={mediaQueryToTextSize()} sx={{ color: categoryApplied() ? selectedCategoryColor : "" }} />
                  {topCategoriesOpen 
                  ?  <KeyboardArrowUpOutlinedIcon fontSize={mediaQueryToTextSize()} sx={{ color: categoryApplied() ? selectedCategoryColor : "" }} />
                  : <KeyboardArrowDownOutlinedIcon fontSize={mediaQueryToTextSize()} sx={{ color: categoryApplied() ? selectedCategoryColor : "" }} />
                  }
                </ToggleButton>
              </Grid>
            </Grid>

            { topCategoriesOpen &&
              <Grid container spacing={1} direction="row" sx={{ justifyContent: "center", alignItems: "flex-start", pb: 2, pt: 0.5 }}>
                <Grid sx={{ textAlign: "center", pl: 1 }} size={{ xs: 4 }}>
                  <>
                  <Chip
                    label={<Typography color="primary" variant="body1">Genres</Typography>}
                    variant="outlined" 
                    color="info" 
                  />
                  </>
                </Grid>
                <Grid sx={{ textAlign: "center" }} size={{ xs: 4 }}>
                  <Chip
                    label={<Typography color="primary" variant="body1">Publishers</Typography>}
                    variant="outlined" 
                    color="info" 
                  />
                </Grid>
                <Grid sx={{ textAlign: "center" }} size={{ xs: 4 }}>
                  <Chip
                    label={<Typography color="primary" variant="body1">Developers</Typography>}
                    variant="outlined"
                    color="info" 
                  />
                </Grid>
                <Grid sx={{ pt: 0, pl: 0 }} size={{ xs: 4 }}>
                  <List sx={{ pt: 0 }} >
                    {topGenres.map((genre: IGenre) => (
                      <ListItem key={genre.id} dense>
                        <ListItemButton 
                          component="a"
                          dense
                          selected={genre.id === navigation.genre}
                          disableGutters={matchesXs}
                          onClick={(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
                            event.preventDefault() // Prevent default anchor link behavior
                            handleCategoryChange("genre", genre.id)
                          }}
                        >
                          <ListItemText 
                            primary={genre.name}
                            slotProps={{
                              primary: { textAlign:"center", flex: 1, color: genre.id === navigation.genre ? selectedCategoryColor : "" }
                            }}
                            sx={{ mt: 0, mb: 0 }} 
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                <Grid sx={{ pt: 0 }} size={{ xs: 4 }}>
                  <List sx={{ pt: 0 }} >
                    {topPublishers.map((publisher: ICompany) => (
                      <ListItem key={publisher.id} dense>
                        <ListItemButton 
                          component="a"
                          dense
                          selected={publisher.id === navigation.publisher}
                          disableGutters={matchesXs}
                          onClick={(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
                            event.preventDefault() // Prevent default anchor link behavior
                            handleCategoryChange("publisher", publisher.id)
                          }}
                        >
                          <ListItemText 
                            primary={publisher.name}
                            slotProps={{
                              primary: { textAlign:"center", flex: 1, color: publisher.id === navigation.publisher ? selectedCategoryColor : "" }
                            }}
                            sx={{ mt: 0, mb: 0 }} 
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                <Grid sx={{ pt: 0 }} size={{ xs: 4 }}>
                  <List sx={{ pt: 0 }} >
                    {topDevelopers.map((developer: ICompany) => (
                      <ListItem key={developer.id} dense>
                        <ListItemButton 
                          component="a"
                          dense
                          selected={developer.id === navigation.developer}
                          disableGutters={matchesXs}
                          onClick={(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
                            event.preventDefault() // Prevent default anchor link behavior
                            handleCategoryChange("developer", developer.id)
                          }}
                        >
                          <ListItemText 
                            primary={developer.name} 
                            slotProps={{
                              primary: { textAlign:"center", flex: 1, color: developer.id === navigation.developer ? selectedCategoryColor : "" }
                            }}
                            sx={{ mt: 0, mb: 0 }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            }

            <GameDetails
              game={selectedGame}
              showUserRating={isAuthenticated && hasRole([roles.user])}
              userRating={userRatings[selectedGame?.id?.toString() || ""]}
              open={gameDetailsOpen}
              handleClose={handleCloseGameDetails}
            />

            <Grid
              container
              rowSpacing={{ xs: 0.5, sm: 1, md: 1.5, lg: 2 }}
              columnSpacing={{ xs: 0.5, sm: 1, md: 1.5, lg: 2 }}
            >
              {data.map((game: IGame) => (
                <Grid key={game.id} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
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
      </Layout>
    </LocalizationProvider>
  )
}

export default Landing
