const endpoints = {
  gamesSvc: {
    domain: (window as any)._env_?.GAMES_URL || "http://localhost:8000",
    games: "/api/games",
    user: "/api/user",
    genres: "/api/genres",
    platforms: "/api/platforms"
  },
  authSvc: {
    domain: (window as any)._env_?.AUTH_URL || "http://localhost:8001",
    signIn: "/signin",
    signUp: "/signup"
  }
}
  
export default endpoints