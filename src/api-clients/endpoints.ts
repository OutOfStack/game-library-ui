const endpoints = {
  gamesSvc: {
    domain: "http://localhost:8000",
    games: "/api/games",
  },
  authSvc: {
    domain: "http://localhost:8001",
    signIn: "/signin",
    signUp: "/signup"
  }
}
  
export default endpoints