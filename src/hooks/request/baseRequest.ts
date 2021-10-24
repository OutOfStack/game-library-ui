import { IValidationResponse } from "../../types/Validation"

const baseRequest = async<T> (url: string, initConfig: RequestInit): Promise<[T | IValidationResponse | number | null, string | null]> => {
    try {
      const resp = await fetch(url, initConfig)
      if (!resp.ok) {
        try {
          const body: IValidationResponse = await resp.json()
          console.log(body)
          return [body, body.error]
        } catch(e) {
          console.log(e)
          return [resp.status, resp.statusText || 'An error occured while fetching data']
        }
      } else {
        console.log(resp)
        return [await resp.json(), null]
      }
    }
    catch(e) {
      console.log(e)
      return [null, 'An error occured']
    }
  }
  
  export default baseRequest