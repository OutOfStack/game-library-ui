import config from '../api-clients/endpoints'
import { authorizedRequestConfig } from './request/requestConfig'
import { baseRequest } from './request/baseRequest'
import useAuth from './useAuth'
import { IGameWithModeration, IModerationItem } from '../types/Moderation'
import { IGame } from '../types/Game'

const usePublisherGames = () => {
  const gamesEndpoint = `${config.gamesSvc.domain}${config.gamesSvc.games}`
  const userEndpoint = `${config.gamesSvc.domain}${config.gamesSvc.user}`

  const { getAccessToken } = useAuth()

  /**
   * Fetch all games for the current publisher
   */
  const fetchPublisherGames = async () => {
    const url = `${userEndpoint}/games`
    const token = getAccessToken()
    const response = await baseRequest<IGame[]>(url, authorizedRequestConfig("GET", token))
    return response
  }

  /**
   * Fetch moderation items for a specific game
   */
  const fetchGameModerations = async (gameId: number) => {
    const url = `${gamesEndpoint}/${gameId}/moderations`
    const token = getAccessToken()
    const response = await baseRequest<IModerationItem[]>(url, authorizedRequestConfig("GET", token))
    return response
  }

  /**
   * Fetch all publisher games with their moderation statuses
   */
  const fetchPublisherGamesWithModerations = async () => {
    const [gamesResp, gamesErr] = await fetchPublisherGames()
    if (gamesErr) {
      return [null, gamesErr] as const
    }

    const games = gamesResp as IGame[]
    const gamesWithModerations: IGameWithModeration[] = []

    // Fetch moderations for each game
    for (const game of games) {
      const [moderationsResp, moderationsErr] = await fetchGameModerations(game.id)

      const gameWithModeration: IGameWithModeration = {
        id: game.id,
        name: game.name,
        logoUrl: game.logoUrl,
        releaseDate: game.releaseDate,
        moderations: moderationsErr ? [] : (moderationsResp as IModerationItem[])
      }

      gamesWithModerations.push(gameWithModeration)
    }

    return [gamesWithModerations, null] as const
  }

  return {
    fetchPublisherGames,
    fetchGameModerations,
    fetchPublisherGamesWithModerations
  }
}

export default usePublisherGames
