import React from 'react';

import CreateCommunity from '../../components/community/CreateCommunity';
import NavBar from '../../components/NavBar';
import Sidebar from '../../components/Sidebar'
import FriendsList from '../../components/FriendsList';
export default function Create() {
    return (
        <>
            <NavBar/>
            <Sidebar/>
            <FriendsList/>
            <CreateCommunity />
        </>

    );
}
