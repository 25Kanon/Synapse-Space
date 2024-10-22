import { useContext, useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import UserSetup from ".././pages/UserSetup";

function PrivateRoute() {
    const { isAuthenticated, isVerified, loading: contextLoading } = useContext(AuthContext);
    const [isAuth, setIsAuth] = useState(false);
    const [isUserVerified, setIsUserVerified] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            if (!contextLoading) {
                const authStatus = await isAuthenticated();
                const verificationStatus = await isVerified();
                setIsAuth(authStatus);
                setIsUserVerified(verificationStatus);
                setLoading(false);
            }
        };

        checkAuth();
    }, [isAuthenticated, isVerified, contextLoading]);

    if (loading || contextLoading) {
        return <div>Loading...</div>; // Show a loading state while checking authentication
    }

    if (!isAuth) {
        return <Navigate to="/login" />; 
    }

    if (isAuth && !isUserVerified) {
        return <UserSetup/>;
    }

    return <Outlet />; // Render children if authenticated and verified
}

export default PrivateRoute;

