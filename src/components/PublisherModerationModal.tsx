import React, { useEffect, useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, IconButton, Collapse, Box, Typography,
  CircularProgress, Alert, useMediaQuery, useTheme
} from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'

import { IGameWithModeration, IModerationItem } from '../types/Moderation'
import { IValidationResponse } from '../types/Validation'
import usePublisherGames from '../hooks/usePublisherGames'

interface IPublisherModerationModalProps {
  isOpen: boolean
  handleClose: () => void
}

const PublisherModerationModal = (props: IPublisherModerationModalProps) => {
  const { isOpen, handleClose } = props

  const theme = useTheme()
  const matchesMd = useMediaQuery(theme.breakpoints.up('md'))
  const matchesSm = useMediaQuery(theme.breakpoints.up('sm'))

  const { fetchPublisherGamesWithModerations } = usePublisherGames()

  const [games, setGames] = useState<IGameWithModeration[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (isOpen) {
      loadGames()
    }
  }, [isOpen])

  const loadGames = async () => {
    setIsLoading(true)
    setError(null)

    const [resp, err] = await fetchPublisherGamesWithModerations()
    if (err) {
      if (typeof err === 'string') {
        setError(err)
      } else {
        const validationError = err as IValidationResponse
        setError(validationError.error || 'Failed to load games')
      }
      setIsLoading(false)
      return
    }

    setGames(resp as IGameWithModeration[])
    setIsLoading(false)
  }

  const toggleRow = (gameId: number) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(gameId)) {
        newSet.delete(gameId)
      } else {
        newSet.add(gameId)
      }
      return newSet
    })
  }

  const getModerationStatusColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    const lowerStatus = status.toLowerCase()
    if (lowerStatus.includes('approved') || lowerStatus.includes('success')) {
      return 'success'
    } else if (lowerStatus.includes('rejected') || lowerStatus.includes('failed')) {
      return 'error'
    } else if (lowerStatus.includes('pending')) {
      return 'warning'
    } else if (lowerStatus.includes('review')) {
      return 'info'
    }
    return 'default'
  }

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      return date.toLocaleString()
    } catch {
      return dateString
    }
  }

  const getLatestModerationStatus = (moderations: IModerationItem[]): IModerationItem | null => {
    if (moderations.length === 0) return null
    return moderations.reduce((latest, current) =>
      new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest
    )
  }

  return (
    <Dialog open={isOpen} onClose={handleClose} fullScreen maxWidth="xl">
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        Publisher Games - Moderation Status
      </DialogTitle>
      <DialogContent>
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!isLoading && !error && games.length === 0 && (
          <Alert severity="info">
            No games found. Add your first game to see moderation status here.
          </Alert>
        )}

        {!isLoading && !error && games.length > 0 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: matchesSm ? 50 : 30 }} />
                  <TableCell><strong>Game</strong></TableCell>
                  {matchesMd && <TableCell><strong>Release Date</strong></TableCell>}
                  <TableCell><strong>Latest Status</strong></TableCell>
                  <TableCell align="right"><strong>Moderations</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {games.map((game) => {
                  const isExpanded = expandedRows.has(game.id)
                  const latestModeration = getLatestModerationStatus(game.moderations)

                  return (
                    <React.Fragment key={game.id}>
                      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => toggleRow(game.id)}
                            disabled={game.moderations.length === 0}
                          >
                            {game.moderations.length > 0 && (
                              isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />
                            )}
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {game.logoUrl && matchesSm && (
                              <img
                                src={game.logoUrl}
                                alt={game.name}
                                style={{ width: 40, height: 53, objectFit: 'cover', borderRadius: 4 }}
                              />
                            )}
                            <Typography variant="body2">{game.name}</Typography>
                          </Box>
                        </TableCell>
                        {matchesMd && (
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(game.releaseDate).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                        )}
                        <TableCell>
                          {latestModeration ? (
                            <Chip
                              label={latestModeration.resultStatus}
                              color={getModerationStatusColor(latestModeration.resultStatus)}
                              size="small"
                            />
                          ) : (
                            <Chip label="No moderation" color="default" size="small" />
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Chip label={game.moderations.length} size="small" variant="outlined" />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={matchesMd ? 5 : 4}>
                          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 2 }}>
                              <Typography variant="h6" gutterBottom component="div">
                                Moderation History
                              </Typography>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell><strong>Status</strong></TableCell>
                                    {matchesSm && <TableCell><strong>Details</strong></TableCell>}
                                    <TableCell><strong>Created</strong></TableCell>
                                    {matchesMd && <TableCell><strong>Updated</strong></TableCell>}
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {game.moderations
                                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                    .map((moderation) => (
                                      <TableRow key={moderation.id}>
                                        <TableCell>
                                          <Chip
                                            label={moderation.resultStatus}
                                            color={getModerationStatusColor(moderation.resultStatus)}
                                            size="small"
                                          />
                                        </TableCell>
                                        {matchesSm && (
                                          <TableCell>
                                            <Typography variant="body2" sx={{ maxWidth: 300 }}>
                                              {moderation.details || '-'}
                                            </Typography>
                                          </TableCell>
                                        )}
                                        <TableCell>
                                          <Typography variant="body2">
                                            {formatDate(moderation.createdAt)}
                                          </Typography>
                                        </TableCell>
                                        {matchesMd && (
                                          <TableCell>
                                            <Typography variant="body2">
                                              {formatDate(moderation.updatedAt)}
                                            </Typography>
                                          </TableCell>
                                        )}
                                      </TableRow>
                                    ))}
                                </TableBody>
                              </Table>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button size="large" variant="contained" onClick={handleClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PublisherModerationModal
