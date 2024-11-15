import React, { useContext, useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import UserSetup from ".././pages/UserSetup";

function PrivateRoute() {
    const { isAuthenticated, isVerified, loading: contextLoading, isAdmin } = useContext(AuthContext);
    const [isAuth, setIsAuth] = useState(false);
    const [isUserAdmin, setIsUserAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            if (!contextLoading) {
                const authStatus = await isAuthenticated();
                const adminStatus = await isAdmin();
                setIsAuth(authStatus);
                setIsUserAdmin(adminStatus);
                setLoading(false);
            }
        };

        checkAuth();
    }, [isAuthenticated, isVerified, contextLoading, isAdmin]);

    if (loading || contextLoading) {
        return <div>Loading...</div>; // Show a loading state while checking authentication
    }

    if (!isAuth) {
        return <Navigate to="/" />;
    }

    if (isAuth && !isUserAdmin) {
        return <Navigate to="/" />;
    }
    console.log(isAuth && isUserAdmin);
    return <Outlet />; // Render children if authenticated and verified
}

export default PrivateRoute;

