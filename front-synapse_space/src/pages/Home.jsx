import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";

import ErrorAlert from "../components/ErrorAlert";
import Sidebar from "../components/Sidebar";
import NavBar from "../components/NavBar";
import FriendsList from "../components/FriendsList";
import MainContentContainer from "../components/MainContentContainer";
import axiosInstance from "../utils/AxiosInstance";
export default function Home() {
    const { isAuthenticated, user, error } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [isAuth, setIsAuth] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const authStatus = await isAuthenticated();
            setIsAuth(authStatus);
            setLoading(false);
        };

        checkAuth();
    }, [isAuthenticated]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!isAuth || !user) {
        return (
            <div>
                <div className="hero bg-base-200 min-h-screen">
                    <p className="text-center text-xl">Welcome to Synapse Space. Please login to continue.</p>
                    {user}
                </div>
            </div>
        );
    }

    return (
        <>
            {error && <ErrorAlert text={error} classExtensions="fixed z-50" />}
            <NavBar />
            <Sidebar />
            <FriendsList />

            <MainContentContainer>
                <div>
                    <h2>Test Refresh Call</h2>
                    <button onClick={() => {
                        axiosInstance.post('api/auth/token/refresh/',{}, {withCredentials: true})
                    }}>Refresh</button>
                </div>
            </MainContentContainer>
        </>
    );
}