/**
 * IGame represents game get model
 */
interface IGame {
	id: number,
	name: string,
	developers: ICompany[],
	publishers: ICompany[],
	releaseDate: string,
	rating: number,
	genres: IGenre[],
	summary?: string,
	slug?: string,
	platforms: IPlatform[],
	logoUrl?: string,
	screenshots: string[],
	websites: string[]
}

/**
 * ICreateGame represents game data we receive from user
 */
interface ICreateGame {
	name: string,
	developer: string,
	releaseDate: string,
	genre: string[],
	logoUrl?: string
}

/** 
 * IUpdateGame represents model for updating information about game
 */
interface IUpdateGame {
	name?: string,
	developer?: string,
	releaseDate?: string,
	genre?: string[],
	logoUrl?: string
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
	genre: string[],
	logoUrl?: string
}

/**
 * ICompany represents company model
 */
interface ICompany {
	id: number,
	name: string
}

/**
 * IGenre represents genre model
 */
interface IGenre {
	id: number,
	name: string
}

/**
 * IPlatform represents platform model
 */
interface IPlatform {
	id: number,
	name: string,
	abbreviation: string
}

/**
 * ICountResponse represents count data
 */
interface ICountResponse {
	count: number
}

export type { IGame, ICreateGame, IUpdateGame, IGameResponse, ICountResponse }