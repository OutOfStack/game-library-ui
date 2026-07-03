import { memo, useEffect, useRef, useState } from 'react'
import { Box, Card, CardActionArea, CardContent, Skeleton, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import StarIcon from '@mui/icons-material/Star'

import { IGame } from '../types/Game'
import { To1Precision } from '../utils/format'


interface IGameCardProps {
  handleOpenDetails: (game: IGame) => void,
  game: IGame,
  userRating?: number
}

const GameCard = (props: IGameCardProps) => {
  const { game, handleOpenDetails, userRating } = props

  const logoWidth = 528
  const logoHeight = 748

  const theme = useTheme()

  const [imageLoaded, setImageLoaded] = useState<boolean>(false)
  const imgRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
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
      variant="outlined"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: '220ms',
        overflow: 'hidden',
        '&:hover': {
          borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.2)',
          boxShadow: '0 14px 30px -14px rgba(0,0,0,0.45)',
          transform: 'translateY(-2px)',
        }
      }}
    >
      <CardActionArea onClick={() => handleOpenDetails(game)}>
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            aspectRatio: `${logoWidth} / ${logoHeight}`,
            overflow: 'hidden',
            bgcolor: 'action.hover',
          }}
        >
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
          {!imageLoaded && (
            <Skeleton
              animation="wave"
              variant="rectangular"
              sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', borderRadius: 0 }}
            />
          )}
          {userRating && (
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.55)',
                backdropFilter: 'blur(8px)',
                borderRadius: '50%',
                width: 32,
                height: 32,
              }}
            >
              <StarIcon sx={{ fontSize: 18, color: '#ffd700' }} />
            </Box>
          )}
        </Box>
      </CardActionArea>
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 }, flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography variant="subtitle1" noWrap sx={{ fontWeight: 600, fontSize: 14, lineHeight: 1.3 }}>
          {game.name}
        </Typography>

        <Typography variant="subtitle2" noWrap sx={{ fontSize: 12 }}>
          {game.publishers?.length > 0
            ? game.publishers[0].name
            : <span>&nbsp;</span>
          }
        </Typography>

        <Box sx={{ mt: 'auto', pt: 0.5, display: 'flex', alignItems: 'center' }}>
          {game.rating > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 600, color: 'text.primary' }}>
              <StarIcon sx={{ fontSize: 13, color: 'primary.main' }} />
              {To1Precision(game.rating)}
            </Box>
          )}
          <Typography sx={{ fontSize: 11, color: 'text.disabled', fontFamily: 'JetBrains Mono, monospace', ml: 'auto' }}>
            {game.releaseDate?.split('-')[0] || ''}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

export default memo(GameCard)
