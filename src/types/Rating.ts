/**
 * ICreateRating represents rating create model
 */
 interface ICreateRating {
	gameId: number,
	rating: number
}

/**
 * ICreateRatingResponse represents response to create rating
 */
 interface ICreateRatingResponse {
    gameId: number,
	rating: number
}

/**
 * IGetUserRatings represents get user ratings request model
 */
 interface IGetUserRatings {
    gameIds: number[]
}

/**
 * IGetUserRatingsResponse represents get user ratings response model
 */
interface IGetUserRatingsResponse {
    [index: string]: number
}

export type { ICreateRating, ICreateRatingResponse, IGetUserRatings, IGetUserRatingsResponse }