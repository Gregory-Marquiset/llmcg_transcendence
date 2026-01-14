import { createContext, useState, useContext } from "react";

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
    const [accessToken, setAccessToken] = useState(null);
    const value = { 
        authUser,
        setAuthUser, 
        isLoggedIn,
        setIsLoggedIn,
        accessToken,
        setAccessToken
    };
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext;