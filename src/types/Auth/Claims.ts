import { JwtPayload } from "jwt-decode"

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
	name?: string,
	/** Requirement to verify user's email */
	vrf_required: boolean
}

export type { IToken, IJWToken }