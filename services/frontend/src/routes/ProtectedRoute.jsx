import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';


const ProtectedRoutes = () => {
    const { authUser,
          setAuthUser,
          isLoggedIn,
          setIsLoggedIn} = useAuth();

    return isLoggedIn ? <Outlet/> : <Navigate to="/SignIn"/>
}

export default ProtectedRoutes