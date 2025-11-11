import { useSyncExternalStore, useMemo } from 'react'
import { jwtDecode } from 'jwt-decode'

import config from '../api-clients/endpoints'
import { authorizedRequestConfig, authorizedRequestConfigWithCredentials, postRequestConfig, postRequestConfigWithCredentials } from './request/requestConfig'
import { baseRequest, noContentRequest } from './request/baseRequest'
import { authorizedRequest, noContentAuthorizedRequest } from './request/authorizedRequest'
import { ISignUp } from '../types/Auth/SignUp'
import { ISignIn } from '../types/Auth/SignIn'
import { IJWToken, IToken } from '../types/Auth/Claims'
import { IVerifyEmailRequest } from '../types/Auth/EmailVerification'

const lsKey = 'gl_user_token'

const subscribers = new Set<() => void>()
const notify = () => subscribers.forEach((cb) => cb())
const subscribe = (cb: () => void) => {
  subscribers.add(cb)
  return () => subscribers.delete(cb)
}

// Sync auth changes across tabs/windows via the Storage event
if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  window.addEventListener('storage', (e: StorageEvent) => {
    if (e.key === lsKey) {
      notify()
    }
  })
}

const useAuth = () => {
  const endpoint = config.authSvc.domain

  const signUp = async (data: ISignUp) => {
    const url = `${endpoint}${config.authSvc.signUp}`
    const response = await baseRequest<IToken>(url, postRequestConfigWithCredentials(data))
    return response
  }

  const signIn = async (data: ISignIn) => {
    const url = `${endpoint}${config.authSvc.signIn}`
    const response = await baseRequest<IToken>(url, postRequestConfigWithCredentials(data))
    return response
  }

  const deleteAccount = async () => {
    const url = `${endpoint}${config.authSvc.deleteAccount}`
    const token = getAccessToken()
    const response = await noContentAuthorizedRequest(url, authorizedRequestConfigWithCredentials("DELETE", token))
    return response
  }

  const signInWithGoogle = async (idToken: string) => {
    const url = `${endpoint}/oauth/google`
    const response = await baseRequest<IToken>(url, postRequestConfigWithCredentials({ idToken: idToken }))
    return response
  }

  const verifyEmail = async (data: IVerifyEmailRequest) => {
    const url = `${endpoint}${config.authSvc.verifyEmail}`
    const token = getAccessToken()
    const response = await baseRequest<IToken>(url, authorizedRequestConfigWithCredentials("POST", token, data))
    return response
  }

  const refreshToken = async (): Promise<[IToken | null, string | null]> => {
    const url = `${endpoint}${config.authSvc.refresh}`
    const [data, err] = await baseRequest<IToken>(url, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
    if (err) {
      return [null, typeof err === 'string' ? err : err.error]
    }
    return [data as IToken, null]
  }

  const resendVerification = async () => {
    const url = `${endpoint}${config.authSvc.resendVerification}`
    const token = getAccessToken()
    const response = await authorizedRequest(url, authorizedRequestConfig("POST", token))
    return response
  }

  const getTokenSnapshot = (): string | null => {
    const raw = localStorage.getItem(lsKey)
    if (!raw) {
      return null
    }
    try {
      const parsed = JSON.parse(raw) as IToken
      const token = parsed?.accessToken
      if (!token) {
        return null
      }
      const { exp, nbf } = jwtDecode<IJWToken>(token)
      const now = (new Date().getTime() / 1000) + 1
      if (exp! < now || nbf! > now) {
        // Token expired - will need to refresh
        // Note: refresh happens automatically in baseRequest on 401
        return null
      }
      return token
    } catch (err) {
      console.error(err)
      return null
    }
  }

  const tokenSnapshot = useSyncExternalStore(subscribe, getTokenSnapshot, getTokenSnapshot)
  const isAuthenticated = tokenSnapshot !== null

  // Memoize claims so they only change when token changes
  const claims = useMemo<IJWToken>(() => {
    if (!tokenSnapshot) return {} as IJWToken
    try {
      return jwtDecode<IJWToken>(tokenSnapshot)
    } catch (err) {
      console.error(err)
      return {} as IJWToken
    }
  }, [tokenSnapshot])

  const logout = () => {
    localStorage.removeItem(lsKey)
    notify()
  }

  const getUserTokenStorage = (): IToken | null => {
    const item = localStorage.getItem(lsKey)
    if (!item) {
      return null
    }
    return JSON.parse(item)
  }

  const setUserTokenStorage = (data: IToken) => {
    localStorage.setItem(lsKey, JSON.stringify(data))
    notify()
  }

  const getAccessToken = (): string => {
    const storage = getUserTokenStorage()
    const access_token = storage ? storage.accessToken : ''
    return access_token
  }

  const hasRole = (allowedRoles: string[]): boolean => {
    return allowedRoles.includes(claims.user_role)
  }

  return {
    isAuthenticated,
    claims,
    setUserTokenStorage,
    getAccessToken,
    hasRole,
    logout,
    signUp,
    signIn,
    deleteAccount,
    signInWithGoogle,
    verifyEmail,
    resendVerification,
    refreshToken
  }
}

export default useAuth
