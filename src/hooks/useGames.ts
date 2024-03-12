import config from '../api-clients/endpoints'
import { authorizedRequestConfig, getRequestConfig, postRequestConfig } from './request/requestConfig'
import baseRequest from './request/baseRequest'
import { IGamesFilter, ICreateGame, IGame, IGameResponse, IGames, IUpdateGame } from '../types/Game'
import { ICreateRating, IRatingResponse } from '../types/Rating'
import useAuth from './useAuth'

const useGames = () => {
  const endpoint = `${config.gamesSvc.domain}${config.gamesSvc.games}`

  const { getAccessToken } = useAuth()

  const fetchPage = async (filter: IGamesFilter, pageSize: number = 20, page: number = 1) => {
    let url = `${endpoint}?pageSize=${pageSize}&page=${page}&orderBy=${filter.orderBy}&name=${filter.name}`
    if (filter.genre !== 0) {
      url += `&genre=${filter.genre}`
    }
    if (filter.developer != 0) {
      url += `&developer=${filter.developer}`
    }
    if (filter.publisher != 0) {
      url += `&publisher=${filter.publisher}`
    }
    const response = await baseRequest<IGames>(url, getRequestConfig)
    return response
  }

  const fetchById = async (id: number) => {
    const url = `${endpoint}/${id}`
    const response = await baseRequest<IGame>(url, getRequestConfig)
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
    create,
    updateById,
    rate
  }
}

export default useGames