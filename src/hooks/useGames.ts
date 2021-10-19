import config from '../api-clients/endpoints'
import { getRequestConfig, postRequestConfig } from './request/requestConfig'
import baseRequest from './request/baseRequest'
import { ICreateGame, IGame, IUpdateGame } from '../types/Game'

const useGames = () => {
  const endpoint = `${config.domain}${config.endpoints.games}`

  const fetchAllData  = async (pageSize: number = 20, lastId: number = 0) => {
    const url = `${endpoint}?pageSize=${pageSize}&lastId=${lastId}`
    const response = await baseRequest<IGame[]>(url, getRequestConfig)
    return response
  }

  const fetchById  = async (id: number) => {
    const url = `${endpoint}/${id}`
    const response = await baseRequest<IGame>(url, getRequestConfig)
    return response
  }

  const postData = async (data: ICreateGame) => {
    const url = endpoint
    const response = await baseRequest<ICreateGame>(url, postRequestConfig(data))
    return response
  }

  const updateById = async (data: IUpdateGame, id: number) => {
    const url = `${endpoint}/${id}`
    const response = await baseRequest<IUpdateGame>(url, {...postRequestConfig(data), method: "PUT" })
    return response
  }

  return {
    fetchAllData,
    fetchById,
    postData,
    updateById
  }
}

export default useGames