import React, { useContext } from "react";
import AuthContext from "../context/AuthContext";

import ErrorAlert  from "../components/ErrorAlert";
import Sidebar from "../components/Sidebar";
import NavBar from "../components/NavBar"
import FriendsList from "../components/FriendsList"
import MainContentContainer from "../components/MainContentContainer";
export default function Home() {
    const { user, error  } = useContext(AuthContext);

    if (!user) {
        return (
            <div>
                <div class="hero bg-base-200 min-h-screen">
                    <p class="text-center text-xl">Welcome to Synapse Space. Please login to continue.</p>
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
                
            </MainContentContainer>
        </>
    );
}