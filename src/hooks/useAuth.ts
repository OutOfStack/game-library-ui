import { useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'

import config from '../api-clients/endpoints'
import { authorizedRequestConfig, postRequestConfig } from './request/requestConfig'
import baseRequest from './request/baseRequest'
import { ISignUp } from '../types/Auth/SignUp'
import { IJWToken, ISignIn, IToken } from '../types/Auth/SignIn'
import { IGetUser } from '../types/Auth/User'

const lsKey = 'gl_user_'

const useAuth = () => {
  const endpoint = config.authSvc.domain

  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const isAuthed = checkAuth()
    setIsAuthenticated(isAuthed)
  }, [])

  const signUp = async (data: ISignUp) => {
    const url = `${endpoint}${config.authSvc.signUp}`
    const response = await baseRequest<IGetUser>(url, postRequestConfig(data))
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
    const response = await baseRequest(url, authorizedRequestConfig("DELETE", token))
    return response
  }

  const signInWithGoogle = async (idToken: string) => {
    const url = `${endpoint}/oauth/google`
    const response = await baseRequest<IToken>(url, postRequestConfig({ idToken: idToken }))
    return response
  }

  const checkAuth = (): boolean => {
    const token = getAccessToken()

    if (!token) {
      if (isAuthenticated) {
        setIsAuthenticated(false)
      }
      return false
    }

    try {
      const { exp, nbf } = jwtDecode<IJWToken>(token)
      const now = (new Date().getTime() / 1000) + 1
      if (exp! < now || nbf! > now) {
        // TODO: use refresh_token
        logout()
        return false
      }
    } catch (err) {
      console.error(err)
      if (isAuthenticated) {
        setIsAuthenticated(false)
      }
      return false
    }

    return true
  }

  const logout = () => {
    localStorage.removeItem(lsKey)
    setIsAuthenticated(false)
    // TODO: remove refresh
    window.location.reload()
  }

  const getUserStorage = (): IToken | null => {
    const item = localStorage.getItem(lsKey)
    if (!item) {
      return null
    }
    return JSON.parse(item)
  }

  const setUserStorage = (data: IToken) => {
    localStorage.setItem(lsKey, JSON.stringify(data))
    setIsAuthenticated(checkAuth())
    // TODO: remove refresh
    window.location.reload()
  }

  const getAccessToken = (): string => {
    const storage = getUserStorage()
    const access_token = storage ? storage.accessToken : ''
    return access_token
  }

  const getClaims = (): IJWToken => {
    if (isAuthenticated) {
      const token = getAccessToken()
      return jwtDecode<IJWToken>(token)
    }
    return {} as IJWToken
  }

  const hasRole = (allowedRoles: string[]): boolean => {
    const claims = getClaims()
    return allowedRoles.includes(claims.user_role)
  }

  return {
    isAuthenticated,
    setUserStorage,
    getAccessToken,
    getClaims,
    hasRole,
    logout,
    signUp,
    signIn,
    deleteAccount,
    signInWithGoogle
  }
}

export default useAuth