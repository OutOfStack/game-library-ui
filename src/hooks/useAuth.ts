import config from '../api-clients/endpoints'
import { postRequestConfig } from './request/requestConfig'
import baseRequest from './request/baseRequest'
import { ISignUp } from '../types/Auth/SignUp'
import { ISignIn, IToken } from '../types/Auth/SignIn'
import { IGetUser } from '../types/Auth/User'

const useAuth = () => {
  const endpoint = config.authSvc.domain

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

  return {
    signUp,
    signIn
  }
}

export default useAuth