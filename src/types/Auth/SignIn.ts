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
interface IJWToken {
	/** Issuer */
	iss: string,
	/** Subject */
	sub: string,
	/** Audience */
	aud: string,
	/** Expiration Time */
	exp: number,
	/** Not Before */
	nbf: number,
	/** Issued At */
	iat: number,
	/** JWT ID */
	jti: string,
	/** User role */
	user_role: string,
	/** Username */
	username: string,
	/** Name of user */
	name?: string
}

export type { ISignIn, IToken, IJWToken }