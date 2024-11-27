import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { useAuthStore } from '../store/useAuthStore';
import ChatSidebar from "../components/CometChat/ChatSidebar";
import NavBar from '../components/NavBar';
import Sidebar from '../components/Sidebar';
import FriendsList from '../components/FriendsList';
import MainContentContainer from '../components/MainContentContainer';
import Footer from '../components/Footer';
import {Helmet} from "react-helmet-async";

export default function Chat() {
    const { isAuthenticated, user } = useAuthStore();

    // Wait until the auth check is complete, and we have user information
    if (!isAuthenticated || !user) {
        return <>Loading...</>;
    }

    return (
        <>
            <Helmet>
                <title> Chat - Synapse Space</title>
            </Helmet>
            <NavBar />
            <Sidebar />
            <FriendsList />
            <MainContentContainer>
                <div className="flex h-full">
                    <ChatSidebar/>
                    <Outlet/>
                </div>

            </MainContentContainer>
            <Footer/>
        </>

    );
}
