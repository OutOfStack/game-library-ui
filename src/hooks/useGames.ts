import config from '../api-clients/endpoints'
import { authorizedRequestConfig, getRequestConfig, postRequestConfig } from './request/requestConfig'
import baseRequest from './request/baseRequest'
import { ICountResponse, ICreateGame, IGame, IGameResponse, IUpdateGame } from '../types/Game'
import { ICreateRating, IRatingResponse } from '../types/Rating'
import useAuth from './useAuth'

const useGames = () => {
  const endpoint = `${config.gamesSvc.domain}${config.gamesSvc.games}`

  const { getAccessToken } = useAuth()

  const fetchPage = async (pageSize: number = 20, page: number = 1, orderBy: string = 'default') => {
    const url = `${endpoint}?pageSize=${pageSize}&page=${page}&orderBy=${orderBy}`
    const response = await baseRequest<IGame[]>(url, getRequestConfig)
    return response
  }

  const fetchById = async (id: number) => {
    const url = `${endpoint}/${id}`
    const response = await baseRequest<IGame>(url, getRequestConfig)
    return response
  }

  const fetchCount = async () => {
    const url = `${endpoint}/count`
    const response = await baseRequest<ICountResponse>(url, getRequestConfig)
    return response
  }

  const search = async (name: string) => {
    const url = `${endpoint}/search?name=${name}`
    const response = await baseRequest<IGame[]>(url, getRequestConfig)
    return response
  }

  const create = async (data: ICreateGame) => {
    const url = endpoint
    const token = getAccessToken()
    const response = await baseRequest<IGameResponse>(url, authorizedRequestConfig("POST", token, data))
    return response
  }

  const updateById = async (data: IUpdateGame, id: number) => {
    const url = `${endpoint}/${id}`
    const response = await baseRequest<IGameResponse>(url, {...postRequestConfig(data), method: "PUT" })
    return response
  }

  const rate = async (data: ICreateRating, id: number) => {
    const url = `${endpoint}/${id}/rate`
    const token = getAccessToken()
    const response = await baseRequest<IRatingResponse>(url, authorizedRequestConfig("POST", token, data))
    return response
  }

  return {
    fetchPage,
    fetchById,
    fetchCount,
    search,
    create,
    updateById,
    rate
  }
}

export default useGames