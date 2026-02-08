import { createContext, useState, useContext, useEffect, useMemo } from "react";

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [authUser, setAuthUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [errStatus, setErrStatus] = useState(0);

  const [accessToken, setAccessToken] = useState(() => localStorage.getItem("access_token"));

  const setToken = (token) => {
    if (!token) {
      localStorage.removeItem("access_token");
      setAccessToken(null);
      return;
    }
    localStorage.setItem("access_token", token);
    setAccessToken(token);
  };

  const logout = () => {
    console.log("[AUTH] logout called");
    setToken(null);
    setIsLoggedIn(false);
    setAuthUser(null);
  };

  const checkRefreshToken = async () => {
    const current = localStorage.getItem("access_token");
    if (!current) return;

    try {
      const res = await fetch("/api/v1/auth/refresh", {
        method: "POST",
        credentials: "include",
      });

      if (res.status === 401) {
        logout();
        alert("Token expired, automatic logout");
        return;
      }

      if (!res.ok) {
        setIsLoggedIn(false);
        setAuthUser(null);
        setErrStatus(res.status);
        setToken(null);
        return;
      }

      const data = await res.json();

      setAuthUser(data.user);
      setIsLoggedIn(true);

      setToken(data.access_token);
    } catch (err) {
      setIsLoggedIn(false);
      setAuthUser(null);
    }
  };

  useEffect(() => {
    checkRefreshToken();
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("access_token")) return;

    const interval = setInterval(() => {
      checkRefreshToken();
    }, 4 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isLoggedIn]);

  const value = useMemo(
    () => ({
      authUser,
      setAuthUser,
      isLoggedIn,
      setIsLoggedIn,
      errStatus,
      setErrStatus,

      accessToken,
      setAccessToken,

      setToken,
      logout,
    }),
    [authUser, isLoggedIn, errStatus, accessToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
