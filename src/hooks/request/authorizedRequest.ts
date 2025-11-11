import config from '../../api-clients/endpoints'
import { IToken } from '../../types/Auth/Claims'
import { IValidationResponse } from '../../types/Validation'
import { baseRequest } from './baseRequest'

const lsKey = 'gl_user_token'

/**
 * Attempts to refresh the access token using the HttpOnly refresh_token cookie
 * @returns Tuple of [new token, error]
 */
const refreshAccessToken = async (): Promise<[IToken | null, string | null]> => {
  const url = `${config.authSvc.domain}${config.authSvc.refresh}`
  const [data, err] = await baseRequest<IToken>(url, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (err) {
    const errorMsg = typeof err === 'string' ? err : err.error
    console.error('Token refresh failed:', errorMsg)
    return [null, errorMsg]
  }

  // Update localStorage with new access token
  if (data) {
    localStorage.setItem(lsKey, JSON.stringify(data))
    // Notify listeners about token change
    window.dispatchEvent(new StorageEvent('storage', { key: lsKey }))
  }

  return [data as IToken, null]
}

/**
 * Enhanced baseRequest that automatically attempts to refresh tokens on 401 errors
 * @param url The endpoint URL
 * @param initConfig The fetch request configuration
 * @param retryOn401 Whether to attempt token refresh on 401 (default: true)
 * @returns Tuple of [data/status, error]
 */
const authorizedRequest = async <T>(
  url: string,
  initConfig: RequestInit,
  retryOn401: boolean = true
): Promise<[T | number | null, IValidationResponse | string | null]> => {
  // Make the initial request
  const [data, err] = await baseRequest<T>(url, initConfig)

  // Check if we got a 401 error and should retry
  if (err && retryOn401) {
    let is401 = false

    // Check if error is a number (status code)
    if (typeof err === 'number' && err === 401) {
      is401 = true
    }
    // Check if error is a validation response with 401 status
    else if (typeof err === 'object' && 'status' in err) {
      const response = err as IValidationResponse
      is401 = response.status === 401
    }

    if (is401) {
      console.log('Received 401, attempting to refresh token...')

      // Attempt to refresh the token
      const [newToken, refreshErr] = await refreshAccessToken()

      if (refreshErr || !newToken) {
        // Refresh failed - clear auth and return original error
        console.error('Token refresh failed, logging out')
        localStorage.removeItem(lsKey)
        window.dispatchEvent(new StorageEvent('storage', { key: lsKey }))
        return [null, err]
      }

      console.log('Token refreshed successfully, retrying original request')

      // Update the Authorization header with the new token
      const updatedConfig = { ...initConfig }
      if (updatedConfig.headers) {
        const headers = new Headers(updatedConfig.headers)
        headers.set('Authorization', `Bearer ${newToken.accessToken}`)
        updatedConfig.headers = headers
      }

      // Retry the original request with the new token (don't retry again on 401)
      return await authorizedRequest<T>(url, updatedConfig, false)
    }
  }

  return [data, err]
}

/**
 * Enhanced noContentRequest that automatically attempts to refresh tokens on 401 errors
 * @param url The endpoint URL
 * @param initConfig The fetch request configuration
 * @returns Error or null
 */
const noContentAuthorizedRequest = async (
  url: string,
  config: RequestInit
): Promise<IValidationResponse | string | null> => {
  const [_, err] = await authorizedRequest(url, config)
  return err
}

export { authorizedRequest, noContentAuthorizedRequest, refreshAccessToken }
