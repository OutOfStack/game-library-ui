import { memo, useEffect, useRef, useState } from 'react'
import { Box, Card, CardActionArea, CardContent, Chip, Skeleton, Stack, Typography, useMediaQuery } from '@mui/material'
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
  const imgRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    // Reset and precheck cache when logo changes
    if (!game.logoUrl) {
      setImageLoaded(true)
      return
    }
    setImageLoaded(false)
    const probe = new Image()
    probe.src = game.logoUrl
    if (probe.complete && probe.naturalWidth > 0) {
      setImageLoaded(true)
    }
  }, [game.logoUrl])

  return (
    <Card
      variant="elevation"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: '200ms',
        overflow: 'hidden',
        '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' }
      }}
    >
      <CardActionArea onClick={() => handleOpenDetails(game)}>
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            aspectRatio: `${logoWidth} / ${logoHeight}`,
            overflow: 'hidden',
            bgcolor: darkMode ? grey[800] : grey[200]
          }}
        >
          {/* Image fills container; toggled via opacity */}
          <Box
            component="img"
            ref={imgRef}
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: imageLoaded ? 1 : 0,
              transition: 'opacity 200ms ease'
            }}
            src={game.logoUrl}
            alt={`${game.name} logo`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
          />
          {/* Skeleton exactly matches container height */}
          {!imageLoaded && (
            <Skeleton
              animation="wave"
              sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', borderRadius: 0 }}
            />
          )}
        </Box>
      </CardActionArea>
      <CardContent
        sx={{ 
          p: 1, 
          '&:last-child': { pb: 1 }, 
          backgroundColor: darkMode ? grey[700] : grey[50]
        }}
      >
        <Typography variant={matchesXs ? "body1" : "subtitle1"} noWrap>
          {game.name}
        </Typography>

        <Typography variant={matchesXs ? "body2" : "subtitle2" } noWrap>
          {game.publishers?.length > 0 
            ? game.publishers[0].name 
            : <div>&nbsp;</div>
          }
        </Typography>

        <Stack 
          sx={{ 
            alignItems: "center", 
            justifyContent: "space-between" 
          }}
          direction="row"
        >
          {game.rating > 0
            ? <Chip 
              label={
                <Typography variant={matchesXs ? "subtitle2" : "subtitle1"}>
                  {To1Precision(game.rating)}
                </Typography>
              }
              color={game.rating >= 4 ? "success" : game.rating === 3 ? "warning" : "error"}
              size="small"
            />
            : <Box sx={{ width: "1vw" }} />
          }
          <Box>
            <span>{game.releaseDate?.split("-")[0] || ""}</span>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default memo(GameCard)
