import React, { Fragment, useEffect, useState } from 'react'
import { Alert, AlertColor, Box, Chip, Container, Dialog, DialogContent, Grid, IconButton, Link, Rating, Skeleton, Snackbar, 
  SnackbarCloseReason, Stack, Typography, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { orange } from '@mui/material/colors'
import RateIcon from '@mui/icons-material/StarBorderPurple500Rounded'
import CloseIcon from '@mui/icons-material/CloseRounded'
import LanguageIcon from '@mui/icons-material/LanguageRounded'
import StoreIcon from '@mui/icons-material/StorefrontRounded'
import SportsEsportsIcon from '@mui/icons-material/SportsEsportsRounded'
import YouTubeIcon from '@mui/icons-material/YouTube'
import TwitterIcon from '@mui/icons-material/Twitter'
import ForumIcon from '@mui/icons-material/ForumRounded'
import LiveTvIcon from '@mui/icons-material/LiveTvRounded'
import FacebookIcon from '@mui/icons-material/Facebook'
import moment from 'moment'

import useGames from '../hooks/useGames'
import { To1Precision, ToHostname } from '../utils/format'
import { IGame } from '../types/Game'
import { IValidationResponse } from '../types/Validation'
import { ICompany } from '../types/Company'
import { IGenre } from '../types/Genre'
import { IPlatform } from '../types/Platform'
import Carousel from './Carousel'


interface IGameDetailsProps {
  open: boolean,
  handleClose: () => void,
  game: IGame | null,
  userRating?: number,
  showUserRating?: boolean,
  darkMode?: boolean
}

const maxWidth = "lg"
const maxScreenshotWidth = 889
const maxScreenshotHeight = 500
const maxLogoHeightMd = 571
const maxLogoHeightSm = 471
const maxLogoHeightXs = 271

const GameDetails = (props: IGameDetailsProps) => {
  const { open, handleClose, game, userRating, showUserRating } = props

  const theme = useTheme()
  const fullscreen = useMediaQuery(theme.breakpoints.down('md'))
  const matchesMd = useMediaQuery(theme.breakpoints.up('md'))
  const matchesXs = useMediaQuery(theme.breakpoints.only('xs'))
  const matchesSm = useMediaQuery(theme.breakpoints.only('sm'))

  const { rate } = useGames()

  const [newUserRating, setNewUserRating] = useState<number | null>(userRating || null)

  const mediaQueryToSize = (): "small" | "medium" | "large" => {
    return matchesXs ? "small" : matchesSm ? "medium" : "large"
  }

  const handleRateGame = async (rating: number | null) => {
    if (rating == null || !game) {
      return
    }
    const [, err] = await rate({ rating: rating }, game.id)
    if (err) {
      if (typeof err === 'string') {
        showNotification(err, "error")
      } else {
        const error = err as IValidationResponse
        showNotification(error.fields?.map(f => `${f.field}: ${f.error}`).join("; ") || error.error, "error")
      }
      return
    }
    setNewUserRating(rating)
  }

  const [logoLoaded, setLogoLoaded] = useState<boolean>(false)
  const [scrDimensions, setScrDimensions] = useState<{width: number, height: number}>({width: maxScreenshotWidth, height: maxScreenshotHeight})

  useEffect(() => {
    setScrDimensions({
      height: matchesXs ? maxScreenshotHeight * 0.45 : matchesSm ? maxScreenshotHeight * 0.7 : maxScreenshotHeight,
      width: matchesXs ? maxScreenshotWidth * 0.45 : matchesSm ? maxScreenshotWidth * 0.7 : maxScreenshotWidth
    })
  }, [matchesXs, matchesSm, matchesMd])

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

  const gridRowSx = {
    paddingTop: matchesXs ? '1px' : theme.spacing(1),
    paddingBottom: matchesXs ? '1px' : theme.spacing(1),
    lineHeight: matchesXs ? 1 : 'normal'
  }

  const chipSx = {
    fontSize: matchesXs ? 11 : 'default',
    mr: theme.spacing(1)
  }

  const handleCloseDialog = () => {
    handleClose()
    setLogoLoaded(false)
    setNewUserRating(null)
  }

  if (!game) {
    return <Fragment />
  }

  const yourRating = newUserRating !== null 
    ? newUserRating
    : (userRating || null)
  
  return (
    <Fragment>
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
      <Dialog
        fullWidth={true}
        maxWidth={maxWidth}
        fullScreen={fullscreen}
        open={open}
        onClose={handleCloseDialog}
        scroll="body"
      >
        <Container maxWidth={maxWidth} disableGutters={true}>
          <DialogContent sx={{padding: matchesXs ? theme.spacing(1) : theme.spacing(2)}}>
            <Grid container direction="row" spacing={matchesXs ? 1 : 2} sx={{ justifyContent: "space-between" }}>
              {/* Logo */}
              <Grid size={{ xs: 6, sm: 6, md: 4.5 }}>
                <Box sx={{
                  textAlign: 'center',
                  maxWidth: '100%'
                }}>
                  <img
                    src={game?.logoUrl || ""}
                    alt={game?.name + " logo"}
                    style={{maxWidth: '100%', display: logoLoaded ? 'inline' : 'none'}}
                    onLoad={() => setLogoLoaded(true)}
                  />
                  {!logoLoaded &&
                    <Skeleton
                      height={ matchesXs ? maxLogoHeightXs : matchesSm ? maxLogoHeightSm : maxLogoHeightMd }
                      variant="rounded" 
                      animation="wave" 
                    />
                  }
                </Box>
              </Grid>

              {/* Close button, release date, publishers, developers, genres, platforms, rating */}
              <Grid container size={{ xs: 6, sm: 6, md: 7.5 }} direction="column" spacing={matchesXs ? 1 : 2}>
                <Grid sx={{textAlign: 'right', pt: matchesXs ? 0 : theme.spacing(1), pb: 0}}>
                  <IconButton
                    sx={{padding: 0}}
                    onClick={handleCloseDialog} 
                    color="secondary" 
                    size={matchesXs ? "small" : "medium"}
                  >
                    <CloseIcon />
                  </IconButton>
                </Grid>
                <Grid sx={{...gridRowSx, pt: 0}}>
                  <Typography variant={matchesXs ? 'h6' : matchesSm ? 'h4' : 'h3'} sx={{fontWeight: matchesXs ? 'normal' : 'bold'}}>{game?.name}</Typography>
                </Grid>
                {game.rating > 0 &&
                  <Grid size={{ xs: 12 }} sx={gridRowSx}>
                    <Chip 
                      label={<Typography variant={matchesXs ? "h6" : "h5"}>{To1Precision(game.rating)}</Typography>}
                      variant="outlined"
                      color={game.rating >= 4 ? "success" : game.rating === 3 ? "warning" : "error"}
                      size={matchesXs || matchesSm ? "small" : "medium"}
                    />
                  </Grid>
                }
                <Grid sx={gridRowSx}>
                  <Typography variant={matchesXs ? "body2" : "h6"} color="primary">Released {moment(game?.releaseDate).format('DD MMM, YYYY')}</Typography>
                </Grid>
                <Grid size={{ xs: 12 }} sx={gridRowSx}>
                  <Typography variant={matchesXs ? "caption" : "subtitle1"} color="primary" sx={chipSx}>Publishers</Typography>
                  {[...game?.publishers ?? []].sort((a, b) => a.name.length - b.name.length).map((p: ICompany) => (
                    <Typography key={p.name} variant={matchesXs ? "caption" : "subtitle2"} color="secondary" sx={{ ...chipSx, display: "inline-block" }}>{p.name}</Typography>
                  ))}
                </Grid>
                <Grid size={{ xs: 12 }} sx={gridRowSx}>
                  <Typography variant={matchesXs ? "caption" : "subtitle1"} color="primary" sx={chipSx}>Developers</Typography>
                  {[...game?.developers ?? []].sort((a, b) => a.name.length - b.name.length).map((d: ICompany) => (
                    <Typography key={d.name} variant={matchesXs ? "caption" : "subtitle2"} color="secondary" sx={{ ...chipSx, display: "inline-block" }}>{d.name}</Typography>
                  ))}
                </Grid>
                <Grid size={{ xs: 12 }} sx={gridRowSx}>
                  <Typography variant={matchesXs ? "caption" : "subtitle1"} color="primary" sx={chipSx}>Genres</Typography>
                  {[...game?.genres ?? []].sort((a, b) => a.name.length - b.name.length).map((g: IGenre) => (
                    <Typography key={g.name} variant={matchesXs ? "caption" : "subtitle2"} color="secondary" sx={{ ...chipSx, display: "inline-block" }}>{g.name}</Typography>
                  ))}
                </Grid>
                <Grid size={{ xs: 12 }} sx={gridRowSx}>
                <Typography variant={matchesXs ? "caption" : "subtitle1"} color="primary" sx={chipSx}>Platforms</Typography>
                  {[...game?.platforms ?? []].sort((a, b) => a.name.localeCompare(b.name)).map((p: IPlatform) => (
                    <Typography key={p.name} variant={matchesXs ? "caption" : "subtitle2"} color="secondary" sx={{ ...chipSx, display: "inline-block" }}>{p.abbreviation}</Typography>
                  ))}
                </Grid>
                {showUserRating && game.releaseDate && moment(game.releaseDate) <= moment() &&
                  <Grid size={{ xs: 12 }} sx={gridRowSx}>
                    <Stack direction="row" sx={{ alignItems: "center" }}>
                      <Typography variant={matchesXs ? "caption" : "subtitle1"} color="primary" sx={chipSx}>Your rating </Typography>
                      <Chip
                        label={
                          <Rating
                            value={yourRating}
                            max={5}
                            defaultValue={0}
                            size={mediaQueryToSize()}
                            icon={<RateIcon fontSize={mediaQueryToSize()} sx={{ color: orange[800] }} />}
                            emptyIcon={<RateIcon fontSize={mediaQueryToSize()} />}
                            onChange={(_, newValue) => handleRateGame(newValue)}
                          />
                        }
                        variant="outlined"
                        onDelete={yourRating? () => {handleRateGame(0)} : undefined }
                        size={matchesXs || matchesSm ? "small" : "medium"}
                      />
                    </Stack>
                  </Grid>
                }
              </Grid>

              {/* Summary */} 
              <Grid size={{ xs: 12 }}>
                <Typography 
                  variant={matchesXs ? "body2" : "body1"} 
                  sx={{
                    letterSpacing: matchesXs ? 0 : 'normal', 
                    fontStyle: 'italic', 
                    mr: matchesXs ? theme.spacing(1) : theme.spacing(5),
                    ml: matchesXs ? theme.spacing(1) : theme.spacing(5)
                  }}
                >
                  {game?.summary}
                </Typography>
              </Grid>

              {/* Screenshots */}
              <Grid size={{ xs: 12 }}>
                <Carousel 
                  imgUrls={game.screenshots} 
                  scrDimensions={{height: scrDimensions.height, width: scrDimensions.width}} 
                  maxImgHeight={maxScreenshotHeight}
                  maxImgWidth={maxScreenshotWidth}
                />
              </Grid>

              {/* websites */}
              {game?.websites?.length && (
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ ml: matchesXs ? theme.spacing(1) : theme.spacing(5) }}>
                    <Typography variant={matchesXs ? 'body1' : 'h6'} color="primary" sx={{ mb: 1 }}>Links</Typography>
                    <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
                      {game.websites.map((url, i) => {
                        const host = ToHostname(url)
                        const lower = host.toLowerCase()
                        let label = host
                        let icon: JSX.Element = <LanguageIcon fontSize="small" />
                        if (lower.includes('steam')) { label = 'Steam'; icon = <StoreIcon fontSize="small" /> }
                        else if (lower.includes('epic')) { label = 'Epic Games'; icon = <StoreIcon fontSize="small" /> }
                        else if (lower.includes('gog')) { label = 'GOG'; icon = <StoreIcon fontSize="small" /> }
                        else if (lower.includes('xbox')) { label = 'Xbox'; icon = <SportsEsportsIcon fontSize="small" /> }
                        else if (lower.includes('playstation')) { label = 'PlayStation'; icon = <SportsEsportsIcon fontSize="small" /> }
                        else if (lower.includes('nintendo')) { label = 'Nintendo'; icon = <SportsEsportsIcon fontSize="small" /> }
                        else if (lower.includes('twitch')) { label = 'Twitch'; icon = <LiveTvIcon fontSize="small" /> }
                        else if (lower.includes('youtube')) { label = 'YouTube'; icon = <YouTubeIcon fontSize="small" /> }
                        else if (lower.includes('twitter') || lower === 'x.com') { label = 'Twitter'; icon = <TwitterIcon fontSize="small" /> }
                        else if (lower.includes('facebook')) { label = 'Facebook'; icon = <FacebookIcon fontSize="small" /> }
                        else if (lower.includes('discord')) { label = 'Discord'; icon = <ForumIcon fontSize="small" /> }
                        return (
                          <Chip
                            key={`${i}-${host}`}
                            component="a"
                            href={url}
                            target="_blank"
                            rel="noopener"
                            clickable
                            size={'small'}
                            icon={icon}
                            label={label}
                            color="info"
                            variant="outlined"
                            sx={{
                              px: 0.5,
                              '& .MuiChip-icon': {
                                ml: 0.25,
                                mr: 0.5,
                                fontSize: 18,
                                width: 18,
                                height: 18,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              },
                              '& .MuiChip-label': {
                                px: 0.5
                              },
                              '&:hover': { borderColor: 'primary.main' }
                            }}
                            title={`${label} (${host})`}
                          />
                        )
                      })}
                    </Stack>
                  </Box>
                </Grid>
              )}
            </Grid>
          </DialogContent>
        </Container>
      </Dialog>
    </Fragment>
  )
}

export default GameDetails
