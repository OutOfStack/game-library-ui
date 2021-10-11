/**
 * ICreateRating represents rating create model
 */
 interface ICreateRating {
	gameId: number,
	rating: number
}

/**
 * IGetUserRatings represents get user ratings model
 */
interface IGetUserRatings {
    gameId: number,
	rating: number
}

export type { ICreateRating, IGetUserRatings }