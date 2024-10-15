import { useContext, useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function PrivateRoute() {
    const { isAuthenticated, loading: contextLoading } = useContext(AuthContext);
    const [isAuth, setIsAuth] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            if (!contextLoading) {
                const authStatus = await isAuthenticated();
                setIsAuth(authStatus);
                setLoading(false);
            }
        };

        checkAuth();
    }, [isAuthenticated, contextLoading]);

    if (loading || contextLoading) {
        return <div>Loading...</div>; // Show a loading state while checking authentication
    }

    return isAuth ? <Outlet /> : <Navigate to="/login" />; // Render children if authenticated, otherwise redirect to login
}

export default PrivateRoute;