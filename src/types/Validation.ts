/**
 * IValidationResponse represents response with validation error
 */
interface IValidationResponse {
  error: string
  fields?: {
    field: string,
    error: string
  }[]
  headers?: Headers
  status?: number
}

export type { IValidationResponse }