import { useEffect } from "react"

function Auth42() {
  useEffect(() => {
    window.location.href = "http://localhost:5000/api/v1/auth/login/42"
  }, [])

  return null
}

export default Auth42