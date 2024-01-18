import config from '../api-clients/endpoints'
import { getRequestConfig } from './request/requestConfig'
import baseRequest from './request/baseRequest'
import { IPlatform } from '../types/Game'

const usePlatforms = () => {
  const endpoint = `${config.gamesSvc.domain}${config.gamesSvc.platforms}`

  const fetchPlatforms = async () => {
    const url = endpoint
    const response = await baseRequest<IPlatform[]>(url, getRequestConfig)
    return response
  }

  return {
    fetchPlatforms
  }
}

export default usePlatforms

