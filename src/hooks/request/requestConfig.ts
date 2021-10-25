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

  const authorizedRequestConfig = (method: string, token: string, body?: object): RequestInit => {
    const req: RequestInit = {
      method: method ? method : "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    }
    if (body) {
      req.body = JSON.stringify(body)
    }
    return req
  }
  
  export { getRequestConfig, postRequestConfig, authorizedRequestConfig }