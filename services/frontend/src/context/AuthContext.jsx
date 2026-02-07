import { createContext, useState, useContext, useEffect, useMemo } from "react";

/**
 * Authentification Context
 */
const AuthContext = createContext(null);

// Custom hook
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [authUser, setAuthUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [errStatus, setErrStatus] = useState(0);

  // ✅ NOUVEAU: token en state (source de vérité pour déclencher WS)
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem("access_token"));

  const logout = () => {
    console.log("[AUTH] logout called");
    localStorage.removeItem("access_token");
    setAccessToken(null);
    setIsLoggedIn(false);
    setAuthUser(null);
  };

  const checkRefreshToken = async () => {
    // Si pas de token => pas besoin de refresh
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
        localStorage.removeItem("access_token");
        setAccessToken(null);
        return;
      }

      const data = await res.json();

      setAuthUser(data.user);
      setIsLoggedIn(true);

      // ✅ MAJ token (localStorage + state)
      localStorage.setItem("access_token", data.access_token);
      setAccessToken(data.access_token);
    } catch (err) {
      setIsLoggedIn(false);
      setAuthUser(null);
      // On ne supprime pas forcément le token ici (à toi de décider)
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

  const value = useMemo(() => ({
    authUser,
    setAuthUser,
    isLoggedIn,
    setIsLoggedIn,
    errStatus,
    setErrStatus,

    // ✅ exposé pour WS + pour le reste de l’app
    accessToken,
    setAccessToken,

    // ✅ utile pour fermer WS proprement
    logout,
  }), [authUser, isLoggedIn, errStatus, accessToken]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
