/**
 * IValidationResponse represents response with validation error
 */
interface IValidationResponse {
  error: string
  fields?: {
    field: string,
    error: string
  }[]
}

export type { IValidationResponse }