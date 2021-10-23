/**
 * IGetUser represents user data to be returned to client
 */
interface IGetUser {
	id: string,
	username: string,
	name: string,
	roleId: string,
	dateCreated: string,
	dateUpdated: string
}

export type { IGetUser }