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
}

export type { IValidationResponse }