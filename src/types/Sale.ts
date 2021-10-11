/**
 * ISale represents sale get model
 */
interface ISale {
	id: number,
	name: string,
	beginDate: string,
	endDate: string
}

/**
 * ICreateSale represents sale data we receive from user
 */
interface ICreateSale {
	name: string,
	beginDate: string,
	endDate: string
}

export type { ISale, ICreateSale }