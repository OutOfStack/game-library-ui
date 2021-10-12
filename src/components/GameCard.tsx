import React, { useState } from 'react'
import { Card, CardContent, Grid, List, ListItem, ListItemText, Rating, Stack, Typography } from '@mui/material'
import InfoIcon from '@mui/icons-material/Info'
import StarIcon from '@mui/icons-material/Star'
import { orange } from '@mui/material/colors'

import { IGame } from '../types/Game'
import { ToCurrency, To1Precision } from '../utils/format'
import MouseOverPopover from './MouseOverPopover'


interface GameCardProps {
  game: IGame,
  userRating?: number
}

const GameCard = (props: GameCardProps) => {
  const { game, userRating } = props

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }

  const handlePopoverClose = () => {
    setAnchorEl(null);
  }

  const openPopover = Boolean(anchorEl);

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1" noWrap>
          {game.name}
        </Typography>

        <Typography variant="subtitle2" noWrap>
          {game.publisher}
        </Typography>
  
        <Grid container direction="row" alignItems="center" justifyContent="space-between">
          <Grid item>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              <StarIcon fontSize="small" sx={{ color: orange[500] }} />
              &nbsp;
              <span>{To1Precision(game.rating)}</span>
            </div>
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
          <Rating
            value={userRating || null}
            max={4}
            defaultValue={0}
            onChange={(_, newValue) => {
              alert(`you gave ${newValue} stars to ${game.name}`)
            }}
          />
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
                  <ListItemText primary="Genre: " secondary={game.genre.join(", ")} />
                </ListItem>
              </List>
            </MouseOverPopover>
          </div>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default GameCard;