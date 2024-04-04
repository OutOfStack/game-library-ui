import config from '../api-clients/endpoints'
import { getRequestConfig } from './request/requestConfig'
import baseRequest from './request/baseRequest'
import { IGenre } from '../types/Genre'

const useGenres = () => {
  const endpoint = `${config.gamesSvc.domain}${config.gamesSvc.genres}`

  const fetchGenres = async () => {
    const url = endpoint
    const response = await baseRequest<IGenre[]>(url, getRequestConfig)
    return response
  }

  const fetchTopGenres = async () => {
    const url = `${endpoint}/top`
    const response = await baseRequest<IGenre[]>(url, getRequestConfig)
    return response
  }

  return {
    fetchGenres,
    fetchTopGenres
  }
}

export default useGenres

