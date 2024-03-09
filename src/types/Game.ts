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
 * IGames represents games get model
 */
interface IGames {
	games: IGame[],
	count: number
}

/**
 * IGamesFilter represents games filter
 */
interface IGamesFilter {
	orderBy: "default" | "name" | "releaseDate",
	name: string,
	genre: number,
	developer: number, 
	publisher: number 
}

/**
 * ICreateGame represents game data receive from publisher
 */
interface ICreateGame {
	name: string,
	developer: string,
	releaseDate: string,
	genresIds: number[],
	logoUrl?: string,
	summary: string,
	platformsIds: number[],
	screenshots: string[],
	websites: string[]
}

/** 
 * IUpdateGame represents model for updating information about game
 */
interface IUpdateGame {
	name?: string,
	developer?: string,
	releaseDate?: string,
	logoUrl?: string,
	genresIds: number[],
	summary: string,
	platformsIds: number[],
	screenshots: string[],
	websites: string[]
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

export type { IGame, IGames, IGamesFilter, ICreateGame, IUpdateGame, IGameResponse, ICountResponse, ICompany, IGenre, IPlatform }