declare global {
  interface Window {
    _env_: {
      GAMES_URL: string
      AUTH_URL: string
      GOOGLE_CLIENT_ID: string
      GITHUB_CLIENT_ID: string
      EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS: string
    }
  }
}

export {}
