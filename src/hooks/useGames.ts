import config from '../api-clients/endpoints'
import { authorizedRequestConfig, getRequestConfig, postRequestConfig } from './request/requestConfig'
import baseRequest from './request/baseRequest'
import { ICreateGame, IGame, IGameResponse, IUpdateGame } from '../types/Game'
import { ICreateRating, IRatingResponse } from '../types/Rating'
import useAuth from './useAuth'

const useGames = () => {
  const endpoint = `${config.gamesSvc.domain}${config.gamesSvc.games}`

  const { getAccessToken } = useAuth()

  const fetchAllData = async (pageSize: number = 20, lastId: number = 0) => {
    const url = `${endpoint}?pageSize=${pageSize}&lastId=${lastId}`
    const response = await baseRequest<IGame[]>(url, getRequestConfig)
    return response
  }

  const fetchById = async (id: number) => {
    const url = `${endpoint}/${id}`
    const response = await baseRequest<IGame>(url, getRequestConfig)
    return response
  }

  const search = async (name: string) => {
    const url = `${endpoint}/search?name=${name}`
    const response = await baseRequest<IGame[]>(url, getRequestConfig)
    return response
  }

  const postData = async (data: ICreateGame) => {
    const url = endpoint
    const response = await baseRequest<IGameResponse>(url, postRequestConfig(data))
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
    fetchAllData,
    fetchById,
    search,
    postData,
    updateById,
    rate
  }
}

export default useGames