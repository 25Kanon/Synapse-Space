// MainContent.js
import React from 'react';
import Friends from './Friends';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-base-200 text-white flex">
            <Sidebar />
            {children}
            <Friends />
        </div>
    );
}

export default Layout;