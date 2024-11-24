import { useContext, useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import UserSetup from ".././pages/UserSetup";
import ForApproval from "../pages/ForApproval";
import RegistrationDenied from "../pages/RegistrationDenied";

function PrivateRoute() {
    const { isAuthenticated, isVerified, isRejected, isCometChatLogin,loading: contextLoading } = useContext(AuthContext);
    const [isAuth, setIsAuth] = useState(false);
    const [isUserVerified, setIsUserVerified] = useState(false);
    const [isUserRejected, setIsUserRejected] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isCometChatLoggedIn, setIsCometChatLoggedIn] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            if (!contextLoading) {
                const authStatus = await isAuthenticated();
                const verificationStatus = await isVerified();
                const RejectStatus = await isRejected();
                const cometChatStatus = await isCometChatLogin();
                setIsCometChatLoggedIn(cometChatStatus);
                setIsAuth(authStatus);
                setIsUserVerified(verificationStatus);
                setIsUserRejected(RejectStatus)
                setLoading(false);
            }
        };

        checkAuth();
    }, [isAuthenticated, isVerified, contextLoading, loading]);

    if (loading || contextLoading) {
        return <div>Loading...</div>; // Show a loading state while checking authentication
    }

    if (!isAuth) {
        return <Navigate to="/login" />; 
    }

    if (isAuth && !isUserVerified) {
        switch (isUserRejected) {
            case null: //isUserRejected is null, setup the account
                return <UserSetup />;
            case true://isUserRejected is true, show rejected message
                return <><RegistrationDenied /></>;
            case false://isUserRejected is false, show waiting for approval message
                return <><ForApproval/></>;
            default:
                return null; // Optional fallback
        }
    }

    return <Outlet />; // Render children if authenticated and verified
}

export default PrivateRoute;

