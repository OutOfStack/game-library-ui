import { useSyncExternalStore } from 'react'
import { jwtDecode } from 'jwt-decode'

import config from '../api-clients/endpoints'
import { authorizedRequestConfig, postRequestConfig } from './request/requestConfig'
import { baseRequest, noContentRequest } from './request/baseRequest'
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
    const response = await baseRequest<IToken>(url, postRequestConfig(data))
    return response
  }

  const signIn = async (data: ISignIn) => {
    const url = `${endpoint}${config.authSvc.signIn}`
    const response = await baseRequest<IToken>(url, postRequestConfig(data))
    return response
  }

  const deleteAccount = async () => {
    const url = `${endpoint}${config.authSvc.deleteAccount}`
    const token = getAccessToken()
    const response = await noContentRequest(url, authorizedRequestConfig("DELETE", token))
    return response
  }

  const signInWithGoogle = async (idToken: string) => {
    const url = `${endpoint}/oauth/google`
    const response = await baseRequest<IToken>(url, postRequestConfig({ idToken: idToken }))
    return response
  }

  const verifyEmail = async (data: IVerifyEmailRequest) => {
    const url = `${endpoint}${config.authSvc.verifyEmail}`
    const token = getAccessToken()
    const response = await baseRequest<IToken>(url, authorizedRequestConfig("POST", token, data))
    return response
  }

  const resendVerification = async () => {
    const url = `${endpoint}${config.authSvc.resendVerification}`
    const token = getAccessToken()
    const response = await noContentRequest(url, authorizedRequestConfig("POST", token))
    return response
  }

  const isTokenValid = (): boolean => {
    const raw = localStorage.getItem(lsKey)
    if (!raw) {
      return false
    }
    try {
      const parsed = JSON.parse(raw) as IToken
      const token = parsed?.accessToken
      if (!token) {
        return false
      }
      const { exp, nbf } = jwtDecode<IJWToken>(token)
      const now = (new Date().getTime() / 1000) + 1
      if (exp! < now || nbf! > now) {
        // TODO: use refresh_token
        return false
      }
      return true
    } catch (err) {
      console.error(err)
      return false
    }
  }

  const isAuthenticated = useSyncExternalStore(subscribe, isTokenValid, isTokenValid)

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

  const getClaims = (): IJWToken => {
    if (!isAuthenticated) return {} as IJWToken
    const token = getAccessToken()
    return jwtDecode<IJWToken>(token)
  }

  const hasRole = (allowedRoles: string[]): boolean => {
    const claims = getClaims()
    return allowedRoles.includes(claims.user_role)
  }

  return {
    isAuthenticated,
    setUserTokenStorage,
    getAccessToken,
    getClaims,
    hasRole,
    logout,
    signUp,
    signIn,
    deleteAccount,
    signInWithGoogle,
    verifyEmail,
    resendVerification
  }
}

export default useAuth
