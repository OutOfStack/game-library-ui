/**
 * IGameSale represents game sale get model
 */
interface IGameSale {
	gameId: number,
	saleId: number,
	sale: string,
	discountPercent: number,
	beginDate: string,
	endDate: string
}

/**
 * ICreateGameSale represents data about game being on sale
 */
interface ICreateGameSale {
	saleId: number,
	discountPercent: number
}

export type { IGameSale, ICreateGameSale }