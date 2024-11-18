import React, {useContext} from 'react';
import { Bell, Search, User } from 'lucide-react';
import AuthContext from '../../context/AuthContext';
import {useNavigate} from "react-router-dom";

const Header = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const getInitials = (name) => {
        return name
            .split(" ")
            .map((word) => word[0])
            .join("");
    };
    return (
        <header className="bg-base-100 border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">

                <div className="flex justify-end w-full me-10">
                    <div className="dropdown dropdown-hover ">
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <div className="text-sm font-semibold">{user.username}</div>
                                <div className="text-xs text-gray-500">{user.email}</div>
                            </div>
                            <div tabIndex={0} role="button" className="p-1 rounded-full">
                                <div className="rounded-full h-7">
                                    {user.pic ? (
                                        <img
                                            src={user.pic}
                                            alt={`Profile picture of ${user.username}`}
                                            className="w-full h-full object-cover rounded-full"
                                        />
                                    ) : (
                                        <div
                                            className="w-full h-full flex items-center justify-center bg-gray-300 rounded-full">
                                                    <span className="text-sm font-semibold">
                                                        {getInitials(user.username)}
                                                    </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <ul tabIndex={0}
                            className="dropdown-content menu bg-base-100 rounded-box z-[1] w-full p-2 shadow">
                            <button className="btn btn-sm" onClick={handleLogout}>Logout</button>
                        </ul>
                    </div>
                </div>
            </div>
        </header>
    )

        ;
};

export default Header;