import React, { useState } from 'react'
import { Alert, AlertColor, Box, Card, CardContent, CardMedia, List, ListItem, ListItemText, Rating, Snackbar, 
  SnackbarCloseReason, Stack, Typography, useMediaQuery } from '@mui/material'
import InfoIcon from '@mui/icons-material/InfoOutlined'
import RateIcon from '@mui/icons-material/StarBorderPurple500Rounded'
import { useTheme } from '@mui/material/styles'
import { grey, orange } from '@mui/material/colors'
import moment from 'moment'

import { IGame } from '../types/Game'
import { To1Precision } from '../utils/format'
import MouseOverPopover from './MouseOverPopover'
import useGames from '../hooks/useGames'
import { IValidationResponse } from '../types/Validation'


interface IGameCardProps {
  game: IGame,
  userRating?: number,
  showUserRating: boolean,
  darkMode: boolean
}

const GameCard = (props: IGameCardProps) => {
  const { game, userRating, showUserRating, darkMode} = props

  const logoWidth = 528
  const logoHeight = 748
  
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
    setAnchorEl(event.currentTarget)
  }

  const handlePopoverClose = () => {
    setAnchorEl(null)
  }

  const openPopover = Boolean(anchorEl)

  //#endregion

  // https://uploadcare.com/docs/transformations/image/resize-crop/
  const getLogoUrl = (url?: string): string | undefined => {
    if (!url) {
      return undefined
    }
    const suffix = `-/crop/${logoWidth}x${Math.round(logoHeight*0.9)}/center/`
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
      <Card variant="elevation" sx={{boxShadow: darkMode ? '0 5px 10px 0 #303030' : '0 8px 16px 0 #9F9F9F'}}>
        <div style={{
          display: 'flex', 
          alignItems: 'center', 
          margin: 'auto'
        }}>
          <CardMedia
            component="img"
            sx={{
              textAlign: 'center',
              maxHeight: logoHeight,
              maxWidth: logoWidth,
              mr: 'auto',
              ml: 'auto'
            }}
            image={getLogoUrl(game.logoUrl)}
            alt={game.name + " logo"}
          />
        </div>
        <CardContent sx={{ padding: 1, '&:last-child': { pb: 1 }, backgroundColor: darkMode ? grey[700] :  grey[50]}}>
          <Typography variant={matchesXs ? "body1" : "subtitle1"} noWrap>
            {game.name}
          </Typography>

          <Typography variant={matchesXs ? "body2" : "subtitle2" } noWrap>
            {game.publishers?.length > 0 ? game.publishers[0].name : <div>&nbsp;</div>}
          </Typography>

          <Stack direction="row" alignItems="center" justifyContent="space-between">
            {game.rating > 0
              ?  <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap'
                }}>
                  <RateIcon sx={{ color: orange[500] }} />
                  &nbsp;
                  <span>{To1Precision(game.rating)}</span>
                </div>
              : <Box/>
            }
            <div
              onMouseEnter={handlePopoverOpen}
            >
              <InfoIcon
                color={openPopover ? "inherit" : "action"}
                sx={{cursor: 'pointer'}}
              />
              <MouseOverPopover
                open={openPopover}
                anchorEl={anchorEl}
                handlePopoverClose={handlePopoverClose}
              >
                <List dense={true} onMouseLeave={handlePopoverClose}>
                  <ListItem>
                    <ListItemText primary={game.name} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Publisher: " secondary={game.publishers?.map(p => p.name).join(" | ")} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Developer: " secondary={game.developers?.map(d => d.name).join(" | ")} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Release date: " secondary={game.releaseDate} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Genres: " secondary={game.genres?.map(g => g.name).join(", ")} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Platforms: " secondary={game.platforms?.map(p => p.abbreviation).join(" | ")} />
                  </ListItem>
                  <ListItem>
                    {showUserRating && game.releaseDate && moment(game.releaseDate) <= moment()
                      ? <>
                        Rate&nbsp;
                        <Rating
                          value={uRating || userRating || null}
                          max={5}
                          defaultValue={0}
                          icon={<RateIcon sx={{ color: orange[800] }} />}
                          emptyIcon={<RateIcon />}
                          onChange={(_, newValue) => handleRateGame(newValue)}
                        />
                      </>
                      : <Box/>
                    }
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