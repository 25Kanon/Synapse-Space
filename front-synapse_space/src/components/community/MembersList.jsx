import React, { useContext } from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import AxiosInstance from "../../utils/AxiosInstance";
import { Link } from "react-router-dom";
import ReportForm from "../ReportForm";
import AuthContext from "../../context/AuthContext";

const MembersList = ({ id }) => {
    const [members, setMembers] = useState([]);
    const { user } = useContext(AuthContext);
    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const response = await AxiosInstance.get(
                    `/api/community/${id}/members/`,
                    {},
                    { withCredentials: true }
                );

                setMembers(response.data);
            } catch (error) {
                console.error("Error fetching memberships:", error);
            }
        };

        fetchMembers();
    }, [id]);
    const getInitials = (name) => {
        if (name == null) { return null }
        return name
            .split(" ")
            .map((word) => word[0])
            .join("");
    };
    return (
        <aside
            id="sidebar"
            className="fixed top-0 right-0 hidden w-64 pt-20 transition-transform -translate-x-full sm:translate-x-0 lg:block"
            style={{ height: "95%" }}
            aria-label="Sidebar"
        >
            <div className="h-full px-3 pb-4 my-3 overflow-y-auto rounded-lg bg-base-200">
                <p className="text-sm font-semibold">Members</p>
                <ul className="space-y-2 font-medium my">
                    {members.map((member) => (
                        <li key={member.user_id}>
                            <div className="flex items-center w-full p-2 mt-3 rounded-full shadow bg-base-100 group">
                                <Link to={`/profile/user/${member.user_id}`}>
                                    <div className="avatar placeholder">
                                        <div className="rounded-full h-7">
                                            {member.userAvatar ? (
                                                <img
                                                    src={member.userAvatar}
                                                    alt="User avatar"
                                                    className="object-cover w-full h-full rounded-full"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center w-full h-full bg-gray-300 rounded-full">
                                                    <span className="text-sm font-semibold">
                                                        {getInitials(member.userName)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                                <span className="overflow-hidden text-sm ms-3 text-ellipsis whitespace-nowrap">
                                    <Link to={`/profile/user/${member.user_id}`}>{member.username}
                                    </Link></span>
                                <div className="ml-auto dropdown dropdown-end">
                                    <label tabIndex={0} className="btn btn-ghost btn-circle">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-5 h-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                                            />
                                        </svg>
                                    </label>
                                    <ul
                                        tabIndex={0}
                                        className="p-2 shadow menu dropdown-content bg-secondary rounded-box"
                                    >
                                        {member.user_id === String(user.id) ? (
                                            <div>
                                                <li>
                                                    <Link
                                                        to={`/profile/user/${member.user_id}`}
                                                    >
                                                        Profile
                                                    </Link>
                                                </li>
                                            </div>
                                        ) : (
                                            <>
                                                <li>
                                                    <Link
                                                        to={`/chat/${member.user_id}`}
                                                    >
                                                        Message
                                                    </Link>
                                                </li>
                                                <li>
                                                    <button
                                                        onClick={() =>
                                                            document
                                                                .getElementById(`UserModal${member.user_id}`)
                                                                .showModal()
                                                        }
                                                    >
                                                        Report
                                                    </button>
                                                </li>
                                            </>
                                        )}

                                        <dialog id={`UserModal${member.user_id}`} className="modal">
                                            <ReportForm
                                                type="user"
                                                object={member.user_id}
                                                community={id}
                                            />
                                        </dialog>
                                    </ul>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
};

export default MembersList;
