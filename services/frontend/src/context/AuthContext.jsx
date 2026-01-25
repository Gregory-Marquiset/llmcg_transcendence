import { createContext, useState, useContext, useEffect } from "react";
/**
 * Authentification Context
 * Povides user authentification state acress the entire app
 * It avoids props drilling by making auth data accessible anywhere.
 */
const AuthContext = createContext();

// Custom hook to access to the authentification context
export function useAuth(){
    return (useContext(AuthContext));
}

/**
 * The AuthProvider component wraps the app and provides the state 
 * to all children
 * @param {React.ReactNode} props.children - child components 
 */
export function AuthProvider ({ children }) {
    const [authUser, setAuthUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const checkRefreshToken = async () => {
      if (!localStorage.getItem("access_token"))
          return ;
      try {
        const res = await fetch("/api/v1/auth/refresh", {
          method: "POST",
          credentials: "include",
        });
        if (!res.ok) {
          setIsLoggedIn(false);
          setAuthUser(null);
          localStorage.removeItem("access_token");
          return ;
        }
        const data = await res.json();
        setAuthUser(data.user);
        setIsLoggedIn(true);
        localStorage.setItem("access_token", data.access_token);
        const seniority = await fetch("/api/v1/statistics/seniority", {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Authorization": `Bearer ${data.access_token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!seniority.ok) {
                console.log("updating seniority failed");
            }
      } catch (err) {
        console.error("Erreur refresh token :", err);
        setIsLoggedIn(false);
        setAuthUser(null);
      }
    }
    useEffect(() => {
      checkRefreshToken();
    }, []);
    useEffect(() => {
      if (!localStorage.getItem("access_token"))
          return ;
      const interval = setInterval(() => {
        checkRefreshToken();
      }, 4 * 60 * 1000);
      return () => clearInterval(interval);
    }, [isLoggedIn]);
    const value = { 
        authUser,
        setAuthUser, 
        isLoggedIn,
        setIsLoggedIn,
    };
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext;