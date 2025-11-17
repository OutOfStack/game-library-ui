/**
 * IModerationItem represents a single moderation record for a game
 */
interface IModerationItem {
  id: number
  resultStatus: string
  details: string
  createdAt: string
  updatedAt: string
}

/**
 * IGameWithModeration represents a game with its moderation statuses
 */
interface IGameWithModeration {
  id: number
  name: string
  logoUrl?: string
  releaseDate: string
  moderations: IModerationItem[]
}

/**
 * IPublisherGamesResponse represents the response from /user/games endpoint
 */
interface IPublisherGamesResponse {
  games: IGameWithModeration[]
}

export type {
  IModerationItem,
  IGameWithModeration,
  IPublisherGamesResponse
}
