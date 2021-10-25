/**
 * IGame represents game get model
 */
interface IGame {
	id: number,
	name: string,
	developer: string,
	publisher: string,
	releaseDate: string,
	price: number,
	currentPrice: number,
	rating: number,
	genre: string[]
}

/**
 * ICreateGame represents game data we receive from user
 */
interface ICreateGame {
	name: string,
	developer: string,
	releaseDate: string,
	price: number,
	genre: string[]
}

/** 
 * IUpdateGame represents model for updating information about game
 */
interface IUpdateGame {
	name?: string,
	developer?: string,
	releaseDate?: string,
	price?: number,
	genre?: string[]
}

/**
 * IGameResponse represents data received after create/update operations
 */
interface IGameResponse {
	id: number,
	name: string,
	developer: string,
	publisher: string,
	releaseDate: string,
	price: number,
	genre: string[]
}

export type { IGame, ICreateGame, IUpdateGame, IGameResponse }