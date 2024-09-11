import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/NavBar.css';
import dropdownImage from '../assets/sampleprofile.png'; 
import App from '../App';
import Settings from './Settings';

const NavBar = () => {
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleLogoClick = () => {
        navigate(<App />);
    };

    const handleDropdownToggle = () => {
        setDropdownOpen(!dropdownOpen); 
    };

    const handleDropdownOptionClick = (value) => {
        switch (value) {
            case 'profile':
                navigate('./com/rofile');
                break;
            case 'settings':
                navigate(<Settings />);
                break;
            case 'logout':
                navigate('/logout');
                break;
            default:
                navigate('/');
        }
        setDropdownOpen(false); 
    };

    return (
        <nav className="navbar">
            <div className="navbar-left" onClick={handleLogoClick}>
                React
            </div>
            <div className="navbar-center">
                <input type="text" placeholder="Search..." />
            </div>
            <div className="navbar-right">
                <div className="dropdown">
                    <img 
                        src={dropdownImage} 
                        alt="Dropdown" 
                        onClick={handleDropdownToggle} 
                        className="dropdown-image"
                    />
                    {dropdownOpen && (
                        <div className="dropdown-menu">
                            <div onClick={() => handleDropdownOptionClick('profile')}>Profile</div>
                            <div onClick={() => handleDropdownOptionClick('settings')}>Settings</div>
                            <div onClick={() => handleDropdownOptionClick('logout')}>Logout</div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default NavBar;
