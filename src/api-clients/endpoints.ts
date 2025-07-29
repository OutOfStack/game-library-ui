const endpoints = {
  gamesSvc: {
    domain: window._env_?.GAMES_URL || "http://localhost:8000",
    games: "/api/games",
    user: "/api/user",
    genres: "/api/genres",
    platforms: "/api/platforms",
    companies: "/api/companies",
  },
  authSvc: {
    domain: window._env_?.AUTH_URL || "http://localhost:8001",
    signIn: "/signin",
    signUp: "/signup",
    updateProfile: "/account",
    deleteAccount: "/account"
  }
}
  
export default endpoints