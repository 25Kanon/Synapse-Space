import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell, faMessage, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import AuthContext from '../context/AuthContext';
import { Link } from 'react-router-dom';

const NavBar = () => {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    const [scrolled, setScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState(''); // State to hold search input

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 0) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Function to handle search submission
    const handleSearchSubmit = (e) => {
        e.preventDefault(); // Prevent default form submission
        if (searchQuery) {
            navigate('/search', { state: { query: searchQuery } }); // Navigate to search page with query
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login'); // Redirect to login page after logout
        } catch (error) {
            console.error('Logout failed:', error);
            // Optionally, you can show an error message to the user
        }
    };

    return (
        <nav className={`fixed top-0 z-40 w-full ${scrolled ? 'bg-base-200' : ''}`}>
            <div className="px-3 py-3 lg:px-5 lg:pl-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center justify-start rtl:justify-end">

                        <a href="https://flowbite.com" className="flex ms-2 md:me-24">
                            <img src="https://flowbite.com/docs/images/logo.svg" className="h-8 me-3" alt="FlowBite Logo" />
                            <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white">Synapse Space</span>
                        </a>
                    </div>
                    {/* Search form */}
                    <form onSubmit={handleSearchSubmit}>
                        <input
                            type="text"
                            placeholder="search"
                            className="w-auto max-w-xs input input-bordered"
                            name="search"
                            required
                            value={searchQuery} // Bind the search input to state
                            onChange={(e) => setSearchQuery(e.target.value)} // Update state on input change
                        />
                    </form>

                    <div className="flex items-center justify-center ms-3 bg-base-200 px-3 rounded-full my-auto h-auto dropdown-left sm:block hidden">
                        <div className="flex items-center py-1 px-2">
                            <FontAwesomeIcon icon={faMessage} className='h-5 mr-5' />
                            <FontAwesomeIcon icon={faBell} className='h-5 ' />
                            <details className="dropdown  dropdown-end dropdown-bottom z-50">
                                <summary className="btn h-5 flex items-center">
                                    <div className="avatar">
                                        <div className="h-7 rounded-full">
                                            <img alt={user.username} src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
                                        </div>
                                    </div>
                                    <p className="text-sm font-semibold flex items-center">
                                        {user.username}
                                        <span>
                                            <FontAwesomeIcon icon={faChevronDown} className='ms-3' />
                                        </span>
                                    </p>

                                </summary>
                                <ul className="menu dropdown-content bg-base-100 rounded-box z-[50] w-52 p-2 shadow">
                                    <li><Link to="/profile">Profile</Link></li>
                                    <li> <button onClick={handleLogout} className="btn btn-logout">Logout</button></li>
                                </ul>
                            </details>
                        </div>
                    </div>

                </div>
            </div>
        </nav>
    );
};

export default NavBar;
