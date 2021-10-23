/** 
 * ISignIn represents data for user sign in
 */ 
interface ISignIn {
	username: string,
	password: string
}

/**
 * IToken represents response to successful Sign In
 */
 interface IToken {
	accessToken: string
}

export type { ISignIn, IToken }