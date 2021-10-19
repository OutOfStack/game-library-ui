const getRequestConfig: RequestInit = {
    method: "GET",
    headers: {
        "Content-Type": "application/json"
    }
  }
  
  const postRequestConfig = (body: object): RequestInit => {
    return {
      ...getRequestConfig,
      method: "POST",
      body: JSON.stringify(body)
    }
  }
  
  export { getRequestConfig, postRequestConfig }