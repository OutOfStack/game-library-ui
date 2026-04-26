import { useSyncExternalStore, useMemo, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'

import config from '../api-clients/endpoints'
import { authorizedRequestConfig, authorizedRequestConfigWithCredentials, postRequestConfig, postRequestConfigWithCredentials } from './request/requestConfig'
import { baseRequest, noContentRequest } from './request/baseRequest'
import { ISignUp } from '../types/Auth/SignUp'
import { ISignIn } from '../types/Auth/SignIn'
import { IJWToken, IToken } from '../types/Auth/Claims'
import { IVerifyEmailRequest } from '../types/Auth/EmailVerification'
import { IValidationResponse } from '../types/Validation'

const lsKey = 'gl_user_token'

const notAuthenticatedMsg = 'Not authenticated'

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

let refreshPromise: Promise<IToken | null> | null = null
let refreshContext: string | null | undefined

const useAuth = () => {
  const endpoint = config.authSvc.domain

  const signUp = async (data: ISignUp): Promise<[number | IToken | null, string | IValidationResponse | null]> => {
    const url = `${endpoint}${config.authSvc.signUp}`
    const response = await baseRequest<IToken>(url, postRequestConfigWithCredentials(data))
    return response
  }

  const signIn = async (data: ISignIn): Promise<[number | IToken | null, string | IValidationResponse | null]> => {
    const url = `${endpoint}${config.authSvc.signIn}`
    const response = await baseRequest<IToken>(url, postRequestConfigWithCredentials(data))
    return response
  }

  const deleteAccount = async (): Promise<string | IValidationResponse | null> => {
    const url = `${endpoint}${config.authSvc.deleteAccount}`
    const token = await getAccessToken()
    if (!token) {
      return notAuthenticatedMsg
    }
    const response = await noContentRequest(url, authorizedRequestConfigWithCredentials("DELETE", token))
    return response
  }

  const signInWithGoogle = async (idToken: string): Promise<[number | IToken | null, string | IValidationResponse | null]> => {
    const url = `${endpoint}/oauth/google`
    const response = await baseRequest<IToken>(url, postRequestConfigWithCredentials({ idToken: idToken }))
    return response
  }

  const signInWithGitHub = async (code: string): Promise<[number | IToken | null, string | IValidationResponse | null]> => {
    const url = `${endpoint}/oauth/github`
    const response = await baseRequest<IToken>(url, postRequestConfigWithCredentials({ code }))
    return response
  }

  const signOut = async (): Promise<string | IValidationResponse | null> => {
    const url = `${endpoint}${config.authSvc.logout}`
    const response = await noContentRequest(url, postRequestConfigWithCredentials())
    return response
  }

  const verifyEmail = async (data: IVerifyEmailRequest): Promise<[number | IToken | null, string | IValidationResponse | null]> => {
    const url = `${endpoint}${config.authSvc.verifyEmail}`
    const token = await getAccessToken()
    if (!token) {
      return [null, notAuthenticatedMsg] as [null, string]
    }
    const response = await baseRequest<IToken>(url, authorizedRequestConfigWithCredentials("POST", token, data))
    return response
  }

  const resendVerification = async (): Promise<string | IValidationResponse | null> => {
    const url = `${endpoint}${config.authSvc.resendVerification}`
    const token = await getAccessToken()
    if (!token) {
      return notAuthenticatedMsg
    }
    const response = await noContentRequest(url, authorizedRequestConfig('POST', token))
    return response
  }

  const hasRole = (allowedRoles: string[]): boolean => {
    return allowedRoles.includes(claims.user_role)
  }

  /* Token management */

  // Calls the backend refresh endpoint using the HttpOnly cookie
  const refreshToken = async (): Promise<[IToken | null, string | null]> => {
    const url = `${endpoint}${config.authSvc.refresh}`
    const [data, err] = await baseRequest<IToken>(url, postRequestConfigWithCredentials())
    if (err || !data) {
      const errorMsg = typeof err === 'string'
        ? err
        : err?.error || 'Token refresh failed'
      return [null, errorMsg]
    }
    return [data as IToken, null]
  }

  // Reads the serialized token payload from localStorage
  const getUserTokenStorage = (): IToken | null => {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null
    }
    const item = localStorage.getItem(lsKey)
    if (!item) {
      return null
    }
    try {
      return JSON.parse(item)
    } catch (err) {
      console.error(err)
      return null
    }
  }

  // Persists the token payload and notifies listeners
  const setUserTokenStorage = (data: IToken) => {
    if (typeof window === 'undefined' || !window.localStorage) {
      return
    }
    localStorage.setItem(lsKey, JSON.stringify(data))
    notify()
  }

  // Removes the token payload and emits a change event
  const clearUserTokenStorage = () => {
    if (typeof window === 'undefined' || !window.localStorage) {
      return
    }
    const hadToken = localStorage.getItem(lsKey) !== null
    localStorage.removeItem(lsKey)
    if (hadToken) {
      notify()
    }
  }

  // Returns the current access token
  const getTokenSnapshot = (): string | null => {
    const storage = getUserTokenStorage()
    return storage?.accessToken || null
  }

  // Checks JWT exp/nbf to see if we can still use the token without refreshing
  const refreshSkewSeconds = 60

  const isTokenValid = (token: string): boolean => {
    try {
      const { exp, nbf } = jwtDecode<IJWToken>(token)
      const now = (new Date().getTime() / 1000) + refreshSkewSeconds
      if (exp && exp < now) {
        return false
      }
      if (nbf && nbf > now) {
        return false
      }
      return true
    } catch (err) {
      console.error(err)
      return false
    }
  }

  // Ensures only one refresh request is in flight; consumers await the shared promise
  const queueRefresh = (previousToken: string | null) => {
    if (!refreshPromise) {
      refreshContext = previousToken
      refreshPromise = refreshToken()
        .then(([token]) => {
          if (!token) {
            const current = getUserTokenStorage()?.accessToken || null
            // Only clear storage if nothing changed while we were refreshing:
            // - If we started with no token and still have none
            // - Or if we started with token X and storage still holds X
            const shouldClear =
              (refreshContext === null && current === null) ||
              (refreshContext !== null && current === refreshContext)
            if (shouldClear) {
              clearUserTokenStorage()
              return null
            }
            return getUserTokenStorage()
          }
          const current = getUserTokenStorage()?.accessToken || null
          // Only overwrite storage if it still contains the token that triggered refresh
          const shouldUpdate =
            refreshContext === null
              ? current === null
              : current === refreshContext
          if (shouldUpdate) {
            setUserTokenStorage(token)
            return token
          }
          return getUserTokenStorage()
        })
        .finally(() => {
          refreshPromise = null
          refreshContext = undefined
        })
    }
    return refreshPromise
  }

  // On initial mount, attempt a refresh if no token is persisted yet
  useEffect(() => {
    if (typeof window === 'undefined' || !window.localStorage) {
      return
    }
    if (!getUserTokenStorage()) {
      queueRefresh(null)
    }
  }, [])

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

  const logout = async () => {
    clearUserTokenStorage()
    await signOut()
  }

  // Used by hooks/service calls to always obtain a valid bearer token
  const getAccessToken = async (): Promise<string> => {
    const storage = getUserTokenStorage()
    const token = storage?.accessToken
    if (!token) {
      const refreshed = await queueRefresh(null)
      return refreshed?.accessToken || ''
    }
    if (isTokenValid(token)) {
      return token
    }
    const refreshed = await queueRefresh(token)
    return refreshed?.accessToken || ''
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
    signInWithGitHub,
    verifyEmail,
    resendVerification,
    notAuthenticatedMsg
  }
}

export default useAuth
