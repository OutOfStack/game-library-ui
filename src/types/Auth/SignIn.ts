import { JwtPayload } from "jwt-decode"

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

/**
 * IJWToken represents data of access token
 */
interface IJWToken extends JwtPayload {
	/** User role */
	user_role: string,
	/** Username */
	username: string,
	/** Name of user */
	name?: string
}

export type { ISignIn, IToken, IJWToken }