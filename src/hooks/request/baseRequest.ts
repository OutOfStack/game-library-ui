const baseRequest = async<T> (url: string, initConfig: RequestInit): Promise<[T | number | null, string | null]> => {
    try {
      const resp = await fetch(url, initConfig)
      if (!resp.ok) {
        try {
          const body = await resp.json()
          console.log(body)
          return [resp.status, body.error]
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