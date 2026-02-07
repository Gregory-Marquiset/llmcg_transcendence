import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

function Auth2() {
  const navigate = useNavigate()
  const { setAuthUser, setIsLoggedIn, setToken } = useAuth()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get("token")

    if (!token) {
      navigate("/signin", { replace: true })
      return
    }

    const payload = JSON.parse(atob(token.split(".")[1]))

    // ✅ IMPORTANT: token d'abord (state + storage) -> WS sans refresh
    setToken(token)

    setAuthUser({ Name: payload.username })
    setIsLoggedIn(true)

    navigate("/dashboard", { replace: true })
  }, [])

  return null
}

export default Auth2
