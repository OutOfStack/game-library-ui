import config from '../api-clients/endpoints'
import { getRequestConfig } from './request/requestConfig'
import baseRequest from './request/baseRequest'
import { ICompany } from '../types/Company'

const useCompanies = () => {
  const endpoint = `${config.gamesSvc.domain}${config.gamesSvc.companies}`

  const fetchTopCompanies = async (type: "dev" | "pub" ) => {
    const url = `${endpoint}/top?type=${type}`
    const response = await baseRequest<ICompany[]>(url, getRequestConfig)
    return response
  }

  return {
    fetchTopCompanies
  }
}

export default useCompanies

