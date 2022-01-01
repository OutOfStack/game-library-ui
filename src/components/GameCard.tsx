import React, { useState } from 'react'
import { Alert, AlertColor, Box, Card, CardContent, CardMedia, Grid, List, ListItem, ListItemText, Rating, Snackbar, 
  SnackbarCloseReason, Stack, Typography, useMediaQuery } from '@mui/material'
import InfoIcon from '@mui/icons-material/Info'
import StarIcon from '@mui/icons-material/Star'
import { orange } from '@mui/material/colors'
import { useTheme } from '@mui/material/styles'
import moment from 'moment'

import { IGame } from '../types/Game'
import { ToCurrency, To1Precision } from '../utils/format'
import MouseOverPopover from './MouseOverPopover'
import useGames from '../hooks/useGames'
import { IValidationResponse } from '../types/Validation'


interface GameCardProps {
  game: IGame,
  userRating?: number,
  showUserRating: boolean
}

const GameCard = (props: GameCardProps) => {
  const { game, userRating, showUserRating } = props

  const logoWidth = 410
  const logoHeight = 200
  
  const theme = useTheme()
  const matchesXs = useMediaQuery(theme.breakpoints.only('xs'))

  const { rate } = useGames()

  const [uRating, setURating] = useState<number | null>(null)

  const handleRateGame = async (rating: number | null) => {
    if (!rating) {
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
    setURating(rating)
  }

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

  //#region popover

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }

  const handlePopoverClose = () => {
    setAnchorEl(null);
  }

  const openPopover = Boolean(anchorEl)

  //#endregion

  // https://uploadcare.com/docs/transformations/image/resize-crop/
  const getLogoUrl = (url?: string): string | undefined => {
    if (!url) {
      return undefined
    }
    const suffix = `-/resize/${logoWidth}x${logoHeight}/`
    return url.endsWith('/') ? `${url}${suffix}` : `${url}/${suffix}`
  }

  return (
    <>
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
      <Card variant="outlined">
        <div style={{
          height: matchesXs ? logoHeight : 160, 
          display: 'flex', 
          alignItems: 'center', 
          margin: 'auto'
        }}>
          <CardMedia
            component="img"
            sx={{
              textAlign: 'center',
              maxHeight: matchesXs ? logoHeight : 160,
              maxWidth: matchesXs ? logoWidth : 330,
              mr: 'auto',
              ml: 'auto'
            }}
            image={getLogoUrl(game.logoUrl)}
            alt={game.name + " logo"}
          />
        </div>
        <CardContent>
          <Typography variant="subtitle1" noWrap>
            {game.name}
          </Typography>

          <Typography variant="subtitle2" noWrap>
            {game.publisher}
          </Typography>
    
          <Grid container direction="row" alignItems="center" justifyContent="space-between">
            <Grid item>
              {game.rating >= 1 &&
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap'
                }}>
                  <StarIcon fontSize="small" sx={{ color: orange[500] }} />
                  &nbsp;
                  <span>{To1Precision(game.rating)}</span>
                </div>
              }
            </Grid>
            
            <Grid item>
              <Typography variant="subtitle1">
                <Typography
                  component="span"
                  variant="body1"
                  sx={{
                    color: 'text.disabled',
                    textDecoration: 'line-through'
                  }}
                >
                  {game.price !== game.currentPrice && ToCurrency(game.price)}
                </Typography>
                &nbsp;
                {ToCurrency(game.currentPrice)}
              </Typography>
            </Grid>
          </Grid>

          <Stack direction="row" alignItems="center" justifyContent="space-between">
            {showUserRating && game.releaseDate && moment(game.releaseDate) <= moment()
              ? <Rating
                value={uRating || userRating || null}
                max={4}
                defaultValue={0}
                onChange={(_, newValue) => handleRateGame(newValue)}
              />
              : <Box/>
            }
            <div
              onMouseEnter={handlePopoverOpen}
              onMouseLeave={handlePopoverClose}
            >
              <InfoIcon
                color="action" 
                sx={{cursor: 'pointer'}}
              />
              <MouseOverPopover
                open={openPopover}
                anchorEl={anchorEl}
                handlePopoverClose={handlePopoverClose}
              >
                <List dense={true}>
                  <ListItem>
                    <ListItemText primary={game.name} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Publisher: " secondary={game.publisher} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Developer: " secondary={game.developer} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Release date: " secondary={game.releaseDate} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Genre: " secondary={game.genre?.join(", ")} />
                  </ListItem>
                </List>
              </MouseOverPopover>
            </div>
          </Stack>
        </CardContent>
      </Card>
    </>
  )
}

export default GameCard;