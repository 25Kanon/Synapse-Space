import React, { useContext, useState, useEffect } from "react";
import 'tailwindcss/tailwind.css';
import 'daisyui';
import NavBar from "../components/profile/NavBar";
import MainContentContainer from "../components/MainContentContainer";
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import MembersList from '../components/community/MembersList';

type LayoutProps = {
    children: React.ReactNode;
    membersListId?: string;
    showSidebar?: boolean
}

const Layout = ({children, membersListId, showSidebar}) => {
return(
    <div className="flex flex-col min-h-screen">
            <NavBar />
            {showSidebar && <Sidebar />}
            {membersListId && <MembersList id={membersListId} />}
            <MainContentContainer>
                {children}
            </MainContentContainer>
            <Footer/>
        </div>
)
}

export default Layout;
