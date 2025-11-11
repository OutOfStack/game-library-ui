const jsonContentType = "application/json"

const getRequestConfig: RequestInit = {
  method: "GET",
  headers: {
    "Content-Type": jsonContentType,
  },
}

const postRequestConfig = (body: object): RequestInit => {
  return {
    ...getRequestConfig,
    method: "POST",
    body: JSON.stringify(body),
  }
}

const postRequestConfigWithCredentials = (body: object): RequestInit => {
  return {
    ...postRequestConfig(body),
    credentials: "include",
  }
}

const authorizedRequestConfig = (
  method: string = "GET",
  token: string,
  body?: BodyInit | object,
  contentType: string | null = jsonContentType,
): RequestInit => {
  const headers: Record<string, string> = {
    Authorization: "Bearer " + token,
  }
  if (contentType != null) {
    headers["Content-Type"] = contentType
  }
  const req: RequestInit = {
    method: method,
    headers: headers,
  }
  if (body) {
    if (contentType === jsonContentType) {
      req.body = JSON.stringify(body as object)
    } else {
      req.body = body as BodyInit
    }
  }
  return req
}

const authorizedRequestConfigWithCredentials = (
  method: string = "GET",
  token: string,
  body?: BodyInit | object,
  contentType: string | null = jsonContentType,
): RequestInit => {
  return {
    ...authorizedRequestConfig(method, token, body, contentType),
    credentials: "include",
  }
}

export {
  getRequestConfig,
  postRequestConfig,
  postRequestConfigWithCredentials,
  authorizedRequestConfig,
  authorizedRequestConfigWithCredentials
}
