import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

const ProtectedRoutes = () => {
    const { authUser,
          setAuthUser,
          isLoggedIn,
          setIsLoggedIn} = useAuth();
    const location = useLocation();
    
    useEffect(() => {
        if (isLoggedIn) {
            localStorage.setItem('lastRoute', location.pathname)
        }
    }, [location.pathname, isLoggedIn])

    return isLoggedIn ? <Outlet/> : <Navigate to="/SignIn"/>
}

export default ProtectedRoutes