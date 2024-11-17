import { useContext, useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import UserSetup from ".././pages/UserSetup";

function PrivateRoute() {
    const { isAuthenticated, isVerified, isRejected,loading: contextLoading } = useContext(AuthContext);
    const [isAuth, setIsAuth] = useState(false);
    const [isUserVerified, setIsUserVerified] = useState(false);
    const [isUserRejected, setIsUserRejected] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            if (!contextLoading) {
                const authStatus = await isAuthenticated();
                const verificationStatus = await isVerified();
                const RejectStatus = await isRejected();
                setIsAuth(authStatus);
                setIsUserVerified(verificationStatus);
                setIsUserRejected(RejectStatus)
                setLoading(false);
            }
        };

        checkAuth();
    }, [isAuthenticated, isVerified, contextLoading, isRejected]);

    if (loading || contextLoading) {
        return <div>Loading...</div>; // Show a loading state while checking authentication
    }

    if (!isAuth) {
        return <Navigate to="/login" />; 
    }


    if (isAuth && !isUserVerified) {
        switch (isUserRejected) {
            case null:
                return <UserSetup />;
            case true:
                return <><h1>You have been rejected</h1></>;
            case false:
                return <><h1>Wait for approval</h1></>;
            default:
                return null; // Optional fallback
        }
    }

    return <Outlet />; // Render children if authenticated and verified
}

export default PrivateRoute;

