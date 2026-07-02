import React, { useState, useEffect } from 'react'
import {
  Backdrop, Box, Button, CircularProgress, Grid, Pagination, Stack, Typography, ToggleButton,
  ToggleButtonGroup, useMediaQuery, useTheme, ListItem, List, ListItemText, ListItemButton, Divider
} from '@mui/material'
import { AdapterMoment as DateAdapter } from '@mui/x-date-pickers/AdapterMoment'
import { LocalizationProvider } from '@mui/x-date-pickers'
import AbcIcon from '@mui/icons-material/AbcRounded'
import WhatshotIcon from '@mui/icons-material/WhatshotRounded'
import DateRangeIcon from '@mui/icons-material/DateRangeRounded'
import StarIcon from '@mui/icons-material/StarHalfRounded'

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
import useGamesNavigation from '../hooks/useGamesNavigation'
import Footer from '../components/Footer'


const topCategoriesLimit = 8

interface IFacetGroupProps {
  title: string
  items: { id: number; name: string }[]
  selected: number
  onSelect: (type: 'genre' | 'publisher' | 'developer', id: number) => void
  type: 'genre' | 'publisher' | 'developer'
}

const FacetGroup = ({ title, items, selected, onSelect, type }: IFacetGroupProps) => {
  const theme = useTheme()
  const accent = theme.palette.primary.main

  if (items.length === 0) return null

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="overline" sx={{ display: 'block', color: 'text.secondary', mb: 0.5 }}>
        {title}
      </Typography>
      <Divider sx={{ mb: 0.5 }} />
      <List dense disablePadding>
        {items.map(item => {
          const isSel = selected === item.id
          return (
            <ListItem key={item.id} disablePadding>
              <ListItemButton
                dense
                selected={isSel}
                onClick={() => onSelect(type, item.id)}
                sx={{
                  borderRadius: 1.5,
                  borderLeft: `2px solid ${isSel ? accent : 'transparent'}`,
                  pl: 1.25,
                  py: 0.75,
                  '&.Mui-selected': {
                    bgcolor: 'action.selected',
                    color: 'text.primary',
                    fontWeight: 500,
                    '&:hover': { bgcolor: 'action.selected' },
                  },
                }}
              >
                <ListItemText
                  primary={item.name}
                  slotProps={{ primary: { fontSize: 13, fontWeight: isSel ? 500 : 400 } }}
                  sx={{ m: 0 }}
                />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>
    </Box>
  )
}

interface IMobilePillRowProps {
  items: { id: number; name: string }[]
  selected: number
  onSelect: (type: 'genre' | 'publisher' | 'developer', id: number) => void
  type: 'genre' | 'publisher' | 'developer'
}

const MobilePillRow = ({ items, selected, onSelect, type }: IMobilePillRowProps) => {
  const theme = useTheme()
  if (items.length === 0) return null
  return (
    <Box sx={{ display: 'flex', gap: 0.75, overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' } }}>
      {items.map(item => {
        const isSel = selected === item.id
        return (
          <Box
            key={item.id}
            onClick={() => onSelect(type, item.id)}
            sx={{
              flexShrink: 0,
              px: 1.5, py: 0.625, borderRadius: 999,
              fontSize: 12, fontWeight: isSel ? 500 : 400,
              border: '1px solid',
              borderColor: isSel ? 'primary.main' : 'divider',
              bgcolor: isSel ? `${theme.palette.primary.main}22` : 'transparent',
              color: isSel ? 'text.primary' : 'text.secondary',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              userSelect: 'none',
              transition: 'all 120ms',
            }}
          >
            {item.name}
          </Box>
        )
      })}
    </Box>
  )
}

interface ILandingProps {
  darkModeProps: IDarkModeProps
}

const Landing = (props: ILandingProps) => {
  const { darkModeProps } = props

  const { fetchPage: fetchGames } = useGames()
  const { fetchRatings } = useUser()
  const { fetchTopGenres } = useGenres()
  const { fetchTopCompanies } = useCompanies()
  const { hasRole, isAuthenticated, claims } = useAuth()
  const vrfRequired = claims.vrf_required || false

  const {
    navigation,
    defaultNavigation,
    pagesCount,
    handleSorting,
    handleSearchTextChange,
    handleCategoryChange,
    handleNavigation,
    resetToFirstPage
  } = useGamesNavigation()

  const theme = useTheme()
  const matchesXs = useMediaQuery(theme.breakpoints.only('xs'))
  const matchesMd = useMediaQuery(theme.breakpoints.up('md'))

  const [data, setData] = useState<IGame[]>([])
  const [count, setCount] = useState<number>(0)
  const [userRatings, setUserRatings] = useState<IGetUserRatingsResponse>({})
  const [topGenres, setTopGenres] = useState<IGenre[]>([])
  const [topDevelopers, setTopDevelopers] = useState<ICompany[]>([])
  const [topPublishers, setTopPublishers] = useState<ICompany[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const [alert, setAlert] = useState<string | IValidationResponse | null>(null)

  const mediaQueryToSize = (): 'small' | 'medium' => matchesXs ? 'small' : 'medium'

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

  //#region add game
  const [addGameDialogOpen, setAddGameDialogOpen] = useState(false)

  const handleAddGameDialogOpen = () => {
    if (vrfRequired) {
      setAlert({ error: 'Please verify your email address first. You can verify it from the user menu.' })
      return
    }
    setAddGameDialogOpen(true)
  }
  const handleAddGameDialogClose = () => setAddGameDialogOpen(false)
  //#endregion

  // get user ratings
  useEffect(() => {
    const getRatings = async () => {
      const gameIds = data.map(d => d.id)
      const [resp, err] = await fetchRatings({ gameIds })
      if (err) { setAlert(err); return }
      setUserRatings(resp as IGetUserRatingsResponse)
    }
    if (isAuthenticated && hasRole([roles.user])) {
      getRatings()
    } else {
      setUserRatings({})
    }
  }, [data, isAuthenticated])

  // fetch games
  useEffect(() => {
    const getData = async () => {
      setIsLoading(true)
      const filter = {
        orderBy: navigation.orderBy,
        name: navigation.searchText,
        genre: navigation.genre,
        developer: navigation.developer,
        publisher: navigation.publisher,
      } as IGamesFilter
      const [resp, err] = await fetchGames(filter, navigation.pageSize, navigation.page)
      if (err) { setAlert(err); setIsLoading(false); return }
      const gamesResp = resp as IGames
      setData(gamesResp.games)
      setCount(gamesResp.count)
      if (navigation.page > pagesCount(gamesResp.count)) resetToFirstPage()
      setIsLoading(false)
    }
    getData()
  }, [navigation.page, navigation.orderBy, navigation.searchText, navigation.genre, navigation.developer, navigation.publisher])

  // fetch top genres
  useEffect(() => {
    const getTopGenres = async () => {
      const [resp, err] = await fetchTopGenres()
      if (err) { setAlert(err); return }
      setTopGenres((resp as IGenre[]).slice(0, topCategoriesLimit))
    }
    getTopGenres()
  }, [])

  // fetch top developers
  useEffect(() => {
    const getTopDevelopers = async () => {
      const [resp, err] = await fetchTopCompanies('dev')
      if (err) { setAlert(err); return }
      setTopDevelopers((resp as ICompany[]).slice(0, topCategoriesLimit))
    }
    getTopDevelopers()
  }, [])

  // fetch top publishers
  useEffect(() => {
    const getTopPublishers = async () => {
      const [resp, err] = await fetchTopCompanies('pub')
      if (err) { setAlert(err); return }
      setTopPublishers((resp as ICompany[]).slice(0, topCategoriesLimit))
    }
    getTopPublishers()
  }, [])

  const searchFieldProps: ISearchFieldProps = {
    text: navigation.searchText,
    changeText: handleSearchTextChange
  }

  const categoryApplied = (): boolean =>
    !!navigation.genre || !!navigation.developer || !!navigation.publisher

  const hasSidebarData = topGenres.length > 0 || topDevelopers.length > 0 || topPublishers.length > 0

  return (
    <LocalizationProvider dateAdapter={DateAdapter}>
      <Layout searchFieldProps={searchFieldProps} darkModeProps={darkModeProps}>
        <Backdrop sx={t => ({ color: '#fff', zIndex: t.zIndex.drawer + 1 })} open={isLoading}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <AddGameModal
          handleAddGameDialogClose={handleAddGameDialogClose}
          addGameDialogOpen={addGameDialogOpen}
        />

        <Notification message={alert} resetMessage={() => setAlert(null)} />

        <Box sx={{ pb: 4 }}>
          {/* Publisher — add game */}
          {hasRole([roles.publisher]) && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', pb: 2 }}>
              <Button variant="contained" size={mediaQueryToSize()} onClick={handleAddGameDialogOpen}>
                Add game
              </Button>
            </Box>
          )}

          {/* Sort row */}
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', pb: 2 }}>
            <ToggleButtonGroup
              value={navigation.orderBy}
              size="small"
              exclusive
              onChange={handleSorting}
              aria-label="sorting"
            >
              <ToggleButton value="default" title="Trending" size={mediaQueryToSize()}>
                <WhatshotIcon fontSize="small" sx={{ mr: matchesXs ? 0 : 0.75 }} />
                {!matchesXs && 'Trending'}
              </ToggleButton>
              <ToggleButton value="releaseDate" title="Newest" size={mediaQueryToSize()}>
                <DateRangeIcon fontSize="small" sx={{ mr: matchesXs ? 0 : 0.75 }} />
                {!matchesXs && 'Newest'}
              </ToggleButton>
              <ToggleButton value="name" title="A–Z" size={mediaQueryToSize()}>
                <AbcIcon fontSize="small" sx={{ mr: matchesXs ? 0 : 0.75 }} />
                {!matchesXs && 'A–Z'}
              </ToggleButton>
              <ToggleButton value="rating" title="Top rated" size={mediaQueryToSize()}>
                <StarIcon fontSize="small" sx={{ mr: matchesXs ? 0 : 0.75 }} />
                {!matchesXs && 'Top rated'}
              </ToggleButton>
            </ToggleButtonGroup>

          </Stack>

          {/* Mobile: horizontal scroll category pills */}
          {!matchesMd && hasSidebarData && (
            <Stack spacing={1} sx={{ pb: 2 }}>
              <MobilePillRow items={topGenres} selected={navigation.genre} onSelect={handleCategoryChange} type="genre" />
              <MobilePillRow items={topPublishers} selected={navigation.publisher} onSelect={handleCategoryChange} type="publisher" />
              <MobilePillRow items={topDevelopers} selected={navigation.developer} onSelect={handleCategoryChange} type="developer" />
            </Stack>
          )}

          {/* Game details modal */}
          <GameDetails
            game={selectedGame}
            showUserRating={isAuthenticated && hasRole([roles.user])}
            userRating={userRatings[selectedGame?.id?.toString() || '']}
            open={gameDetailsOpen}
            handleClose={handleCloseGameDetails}
          />

          {/* 2-col layout: sidebar + grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: hasSidebarData ? '200px 1fr' : '1fr' }, gap: { xs: 2, md: 4 } }}>
            {/* Sidebar — md+ only */}
            {hasSidebarData && (
              <Box sx={{ display: { xs: 'none', md: 'block' }, position: 'sticky', top: 80, alignSelf: 'start' }}>
                <FacetGroup title="Genre" items={topGenres} selected={navigation.genre} onSelect={handleCategoryChange} type="genre" />
                <FacetGroup title="Publisher" items={topPublishers} selected={navigation.publisher} onSelect={handleCategoryChange} type="publisher" />
                <FacetGroup title="Developer" items={topDevelopers} selected={navigation.developer} onSelect={handleCategoryChange} type="developer" />
              </Box>
            )}

            {/* Games grid + pagination */}
            <Box>
              {count > 0 && (
                <Typography variant="caption" sx={{ display: 'block', color: 'text.disabled', mb: 1.5, fontFamily: 'JetBrains Mono, monospace' }}>
                  {count.toLocaleString()} titles
                </Typography>
              )}
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
                      userRating={userRatings[game.id?.toString()]}
                    />
                  </Grid>
                ))}
              </Grid>

              {count > 0 && (
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
              )}
            </Box>
          </Box>
        </Box>
        <Footer />
      </Layout>
    </LocalizationProvider>
  )
}

export default Landing
