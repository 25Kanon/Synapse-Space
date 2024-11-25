import React, { useContext, useState, useEffect } from "react";
import 'tailwindcss/tailwind.css';
import 'daisyui';
import NavBar from "../components/profile/NavBar";
import MainContentContainer from "../components/MainContentContainer";
import Footer from '../components/Footer';


type LayoutProps = {
    children: React.ReactNode;
    membersListId?: string;
    showSidebar?: boolean
}

const LayoutProfile = ({children, membersListId, showSidebar}) => {
return(
    <div className="flex flex-col min-h-screen">
            <NavBar />
            <MainContentContainer>
                {children}
            </MainContentContainer>
            <Footer/>
        </div>
)
}

export default LayoutProfile;
