import { useState } from 'react'
import { Box, Card, CardContent, CardMedia, Chip, Skeleton, Stack, Typography, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { grey } from '@mui/material/colors'

import { IGame } from '../types/Game'
import { To1Precision } from '../utils/format'


interface IGameCardProps {
  handleOpenDetails: (game: IGame) => void,
  game: IGame,
  darkMode: boolean
}

const GameCard = (props: IGameCardProps) => {
  const { game, handleOpenDetails, darkMode } = props

  const logoWidth = 528
  const logoHeight = 748
  
  const theme = useTheme()
  const matchesXs = useMediaQuery(theme.breakpoints.only('xs'))

  const [imageLoaded, setImageLoaded] = useState<boolean>(false)

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
    <Card variant="elevation" sx={{boxShadow: darkMode ? '0 5px 10px 0 #303030' : '0 8px 16px 0 #9F9F9F'}}>
    <Box sx={{
        display: 'flex', 
        alignItems: 'center', 
        margin: 'auto'
      }}
      onClick={() => matchesXs && handleOpenDetails(game)}
    >
      <CardMedia
        component="img"
        sx={{
          textAlign: 'center',
          maxHeight: logoHeight,
          maxWidth: logoWidth,
          mr: 'auto',
            ml: 'auto',
            display: imageLoaded ? 'inline' : 'none'
        }}
        image={getLogoUrl(game.logoUrl)}
        alt={game.name + " logo"}
        onLoad={() => setImageLoaded(true)}
      />
      {!imageLoaded &&
        <Skeleton width="100%" height={235} variant="rounded" animation="wave" />
      }
    </Box>
    <CardContent 
        sx={{ padding: 1, '&:last-child': { pb: 1 }, backgroundColor: darkMode ? grey[700] :  grey[50], cursor: 'pointer' }} 
        onClick={() => handleOpenDetails(game)}
    >
      <Typography variant={matchesXs ? "body1" : "subtitle1"} noWrap>
        {game.name}
      </Typography>

      <Typography variant={matchesXs ? "body2" : "subtitle2" } noWrap>
        {game.publishers?.length > 0 ? game.publishers[0].name : <div>&nbsp;</div>}
      </Typography>

      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
        {game.rating > 0
          ? <Chip 
            label={<Typography variant={matchesXs ? "subtitle2" : "subtitle1"}>{To1Precision(game.rating)}</Typography>}
            variant="outlined"
            color={game.rating >= 4 ? "success" : game.rating === 3 ? "warning" : "error"}
            size="small"
          />
          : <Box sx={{width: '1vw'}}/>
        }
        <Box>
          <span>{game.releaseDate?.split("-")[0] || ""}</span>
        </Box>
      </Stack>
    </CardContent>
  </Card>
  </>
  )
}

export default GameCard