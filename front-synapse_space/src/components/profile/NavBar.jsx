import React, { useState, useContext, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBell,
    faMessage,
    faChevronDown,
    faCheck,
    faTimes,
} from "@fortawesome/free-solid-svg-icons";
import AuthContext from "../../context/AuthContext";
import { useFriends } from "../../context/FriendContext";

const NavBar = () => {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    const { acceptFriendRequest, rejectFriendRequest, filteredFriendRequests } =
        useFriends();
    const [scrolled, setScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState(""); // State to hold search input
    const location = useLocation();
    const isOnSearchPage = location.pathname === "/search";
    const getInitials = (name) => {
        return name
            .split(" ")
            .map((word) => word[0])
            .join("");
    };

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 0);
        };

        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    // Function to handle search submission
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery) {
            navigate("/search", { state: { query: searchQuery } });
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <nav className={`fixed top-0 z-40 w-full ${scrolled ? "bg-base-200" : ""}`}>
            <div className="px-3 py-3 lg:px-5 lg:pl-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center justify-start rtl:justify-end">
                        <a href="https://flowbite.com" className="flex ms-2 md:me-24">
                            <img
                                src="https://flowbite.com/docs/images/logo.svg"
                                className="h-8 me-3"
                                alt="FlowBite Logo"
                            />
                            <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white">
                Synapse Space
              </span>
                        </a>
                    </div>
                    {/* Search form */}
                    {!isOnSearchPage && (
                        <form onSubmit={handleSearchSubmit}>
                            <input
                                type="text"
                                placeholder="search"
                                className="w-auto max-w-xs input input-bordered"
                                name="search"
                                required
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </form>
                    )}

                    <div className="flex items-center justify-center hidden px-3 my-auto rounded-full ms-3 bg-base-200 dropdown-left sm:block ">
                        <div className="z-40 flex items-center px-2 py-1">
                            <FontAwesomeIcon icon={faMessage} className="z-40 h-5 mr-5" />
                            <details className="z-40 dropdown dropdown-end dropdown-bottom">
                                <summary className="flex items-center h-5 btn">
                                    <FontAwesomeIcon icon={faBell} className="h-5" />
                                    {filteredFriendRequests.length > 0 && (
                                        <span className="absolute top-0 right-0 z-40 flex items-center justify-center w-5 h-5 text-xs text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                      {filteredFriendRequests.length}
                    </span>
                                    )}
                                </summary>
                                <ul className="menu dropdown-content bg-base-100 rounded-box z-[60] min-w-80 w-auto p-2 shadow">
                                    {filteredFriendRequests.length > 0 ? (
                                        filteredFriendRequests.map((request) => (
                                            <li
                                                key={request.id}
                                                className="flex items-center justify-between w-full gap-3 p-2 whitespace-nowrap"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className="avatar placeholder">
                                                        <div className="rounded-full h-7">
                                                            {request.sender_profile_pic ? (
                                                                <img
                                                                    src={request.sender_profile_pic}
                                                                    alt={`Profile picture of ${request.sender_name}`}
                                                                    className="object-cover w-full h-full rounded-full"
                                                                />
                                                            ) : (
                                                                <div className="flex items-center justify-center w-full h-full bg-gray-300 rounded-full">
                                  <span className="text-sm font-semibold">
                                    {getInitials(request.sender_name)}
                                  </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <Link
                                                        to={`/profile/${request.sender}`}
                                                        className="flex-1"
                                                    >
                                                        {request.sender_name}
                                                    </Link>
                                                    <button
                                                        onClick={() => acceptFriendRequest(request.id)}
                                                        className="flex items-center gap-1 btn btn-xs btn-primary"
                                                    >
                                                        <FontAwesomeIcon icon={faCheck} />
                                                        Accept
                                                    </button>
                                                    <button
                                                        onClick={() => rejectFriendRequest(request.id)}
                                                        className="flex items-center gap-1 btn btn-xs btn-error"
                                                    >
                                                        <FontAwesomeIcon icon={faTimes} />
                                                        Reject
                                                    </button>
                                                </div>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="p-2 text-center">No friend requests</li>
                                    )}
                                </ul>
                            </details>

                            <details className="dropdown dropdown-end dropdown-bottom z-1">
                                <summary className="flex items-center h-5 btn">
                                    <div className="avatar placeholder">
                                        <div className="rounded-full h-7">
                                            {user.pic ? (
                                                <img
                                                    src={user.pic}
                                                    alt={`Profile picture of ${user.username}`}
                                                    className="object-cover w-full h-full rounded-full"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center w-full h-full bg-gray-300 rounded-full">
                          <span className="text-sm font-semibold">
                            {getInitials(user.username)}
                          </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <p className="flex items-center text-sm font-semibold">
                                        {user.username}
                                        <span>
                      <FontAwesomeIcon icon={faChevronDown} className="ms-3" />
                    </span>
                                    </p>
                                </summary>
                                <ul className="menu dropdown-content bg-base-100 rounded-box z-[50] w-52 p-2 shadow">
                                    <li>
                                        <Link to="/">Home</Link>
                                    </li>
                                    <li>
                                        <button onClick={handleLogout} className="btn btn-logout">
                                            Logout
                                        </button>
                                    </li>
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
