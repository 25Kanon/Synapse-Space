import React, { useContext } from "react";
import AuthContext from "../../context/AuthContext";

import CreateCommunity from '../../components/community/CreateCommunity';
import ErrorAlert from '../../components/ErrorAlert';
import NavBar from '../../components/NavBar';
import Sidebar from '../../components/Sidebar'
import FriendsList from '../../components/FriendsList';
export default function Create() {
    const { user, error} = useContext(AuthContext);

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
        {error && <ErrorAlert text={error} />}
            <NavBar/>
            <Sidebar/>
            <FriendsList/>
            <CreateCommunity />
        </>

    );
}
