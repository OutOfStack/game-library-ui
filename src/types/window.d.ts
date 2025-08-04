declare global {
  interface Window {
    _env_: {
      GAMES_URL: string
      AUTH_URL: string
      GOOGLE_CLIENT_ID: string
    }
  }
}

export {}