import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import AuthContext from "../context/AuthContext";

function PublicRoute() {
    let { isAuthenticated } = useContext(AuthContext);

    return isAuthenticated ? <Navigate to="/" /> : <Outlet />;
}

export default PublicRoute;