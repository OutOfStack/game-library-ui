import config from '../api-clients/endpoints'
import { getRequestConfig } from './request/requestConfig'
import baseRequest from './request/baseRequest'
import { IGenre } from '../types/Game'

const useGenres = () => {
  const endpoint = `${config.gamesSvc.domain}${config.gamesSvc.genres}`

  const fetchGenres = async () => {
    const url = endpoint
    const response = await baseRequest<IGenre[]>(url, getRequestConfig)
    return response
  }

  return {
    fetchGenres
  }
}

export default useGenres

