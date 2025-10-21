/**
 * ISignUp represents data for user sign up
 */
interface ISignUp {
	username: string,
	name: string,
	email: string,
	password: string,
	confirmPassword: string,
	isPublisher: boolean
}

export type { ISignUp }