const endpoints = {
  gamesSvc: {
    domain: window._env_?.GAMES_URL || "http://localhost:8000",
    games: "/api/games",
    sales: "/api/sales",
    user: "/api/user"
  },
  authSvc: {
    domain: window._env_?.AUTH_URL || "http://localhost:8001",
    signIn: "/signin",
    signUp: "/signup"
  }
}
  
export default endpoints