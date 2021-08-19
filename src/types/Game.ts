/**
 * IGetGame represents game get model
 */
interface IGetGame {
	id: number,
	name: string,
	developer: string,
	releaseDate: string,
	price: number,
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

export type { IGetGame, ICreateGame, IUpdateGame }