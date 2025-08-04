import config from '../api-clients/endpoints'
import { authorizedRequestConfig } from './request/requestConfig'
import baseRequest from './request/baseRequest'
import useAuth from './useAuth'
import { IGetUserRatings, IGetUserRatingsResponse } from '../types/Rating'

const useUser = () => {
  const endpoint = `${config.gamesSvc.domain}${config.gamesSvc.user}`

  const { getAccessToken } = useAuth()

  const fetchRatings = async (data: IGetUserRatings) => {
    const url = `${endpoint}/ratings`
    const token = getAccessToken()
    const response = await baseRequest<IGetUserRatingsResponse>(url, authorizedRequestConfig("POST", token, data))
    return response
  }

  return {
    fetchRatings
  }
}

export default useUser

