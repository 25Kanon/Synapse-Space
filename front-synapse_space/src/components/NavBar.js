import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import App from '../App';
import Settings from './Settings';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell, faMessage, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import AuthContext from '../context/AuthContext';
const NavBar = () => {
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { user, logoutUser } = useContext(AuthContext);


    return (
        <nav class="top-0 z-50 w-full ">
            <div class="px-3 py-3 lg:px-5 lg:pl-3">
                <div class="flex items-center justify-between">
                    <div class="flex items-center justify-start rtl:justify-end">

                        <a href="https://flowbite.com" class="flex ms-2 md:me-24">
                            <img src="https://flowbite.com/docs/images/logo.svg" class="h-8 me-3" alt="FlowBite Logo" />
                            <span class="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white">Flowbite</span>
                        </a>
                    </div>
                    <div>
                        <input
                            type="text"
                            placeholder="search"
                            className="input input-bordered max-w-xs w-auto"
                            name="search"
                            required
                        />
                    </div>

                    <div class="flex items-center justify-center ms-3 bg-base-200 px-3 rounded-full my-auto h-auto dropdown-left sm:block hidden">
                        <div class="flex items-center py-1 px-2">
                            <FontAwesomeIcon icon={faMessage} className='mr-5 h-5' />
                            <FontAwesomeIcon icon={faBell} className=' h-5' />
                            <details class="dropdown  dropdown-end dropdown-bottom z-50">
                                <summary class="btn h-5 flex items-center">
                                    <div class="avatar">
                                        <div class="h-7 rounded-full">
                                            <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
                                        </div>
                                    </div>
                                    <p class="text-sm font-semibold flex items-center">
                                        {user.username}
                                        <span>
                                            <FontAwesomeIcon icon={faChevronDown} className='ms-3' />
                                        </span>
                                    </p>

                                </summary>
                                <ul class="menu dropdown-content bg-base-100 rounded-box z-[52] w-52 p-2 shadow">
                                    <li><a>Item 1</a></li>
                                    <li> <button onClick={logoutUser} class="btn btn-logout">Logout</button></li>
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
