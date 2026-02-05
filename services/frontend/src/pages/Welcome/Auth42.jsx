import { useEffect } from "react"

function Auth42() {
  useEffect(() => {
    const host = window.location.hostname;
    window.location.href = `http://${host}:5000/api/v1/auth/login/42`
  }, [])

  return null
}

export default Auth42