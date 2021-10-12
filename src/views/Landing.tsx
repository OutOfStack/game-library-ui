import React from 'react'
import { Box, Container, Grid, Typography } from '@mui/material'

import Layout from '../components/Layout'
import GameCard from '../components/GameCard'
import { IGame } from '../types/Game'


const games: IGame[] = [
  {
    id: 1,
    name: "Red Dead Redemption 2",
    developer: "Rockstar Games",
    publisher: "Rockstar Games",
    releaseDate: "2019-12-05",
    price: 60,
    genre: [
      "Action",
      "Western",
      "Adventure"
    ],
    currentPrice: 60,
    rating: 2.6190476
  },
  {
    id: 2,
    name: "Ori and the Will of the Wisps",
    developer: "Moon Studios GmbH",
    publisher: "Xbox Game Studios",
    releaseDate: "2020-03-11",
    price: 20,
    genre: [
      "Action",
      "Platformer"
    ],
    currentPrice: 14,
    rating: 2.7727273
  },
  {
    id: 3,
    name: "The Wolf Among Us",
    developer: "Telltale",
    publisher: "Telltale",
    releaseDate: "2013-10-11",
    price: 20,
    genre: [
      "Adventure",
      "Episodic",
      "Detective"
    ],
    currentPrice: 2,
    rating: 2.6
  }
]

const Landing = () => {
  return (
    <Layout>
      <Container maxWidth="xl">
        <Box sx={{ pb: 3 }}>
          <Typography variant="h4" sx={{pb: 3}}>Games</Typography>
          <Grid container spacing={3}>
            {games.map((game: IGame) => (
              <Grid key={game.id} item xs={12} sm={6} md={3}>
                <GameCard game={game} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Layout>
  )
}

export default Landing