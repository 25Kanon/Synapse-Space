import React from 'react';
import NavBar from './NavBar';
import '../components/styles/NavBar.css';

function Settings() {
    return (
        <div>
            <NavBar />
            <div className="settings-content">
                Settings
            </div>
        </div>
    )
}

export default Settings;
