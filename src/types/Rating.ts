/**
 * ICreateRating represents rating create model
 */
 interface ICreateRating {
	rating: number
}

/**
 * IRatingResponse represents response to create rating
 */
 interface IRatingResponse {
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

export type { ICreateRating, IRatingResponse, IGetUserRatings, IGetUserRatingsResponse }