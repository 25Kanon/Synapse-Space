import { useContext, useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function PublicRoute() {
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

    return isAuth ? <Navigate to="/" /> : <Outlet />; // Redirect if authenticated, otherwise render children
}

export default PublicRoute;