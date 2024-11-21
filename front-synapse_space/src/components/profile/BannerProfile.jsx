import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { useFriends } from "../../context/FriendContext";
import AxiosInstance from "../../utils/AxiosInstance";

const BannerProfile = ({
    first_name,
    last_name,
    username,
    profAvatar,
    profBanner,
    bio,
    profileId = null,
    isSelf = false,
}) => {
    const navigate = useNavigate();
    const { friends, friendRequests, sendFriendRequest, acceptFriendRequest, rejectFriendRequest } = useFriends();

    const isFriend = friends.some((friend) => friend.username === username);

    // Check if there is an incoming friend request from this user
    const incomingRequest = friendRequests.find(
        (request) => request.sender === profileId
    );

    const getInitials = (name) => (name ? name[0] : "");

    const handleEditClick = () => {
        navigate("/edit-profile");
    };

    const handleUnfriendClick = async () => {
        try {
            const response = await AxiosInstance.delete(`api/friendship/unfriend/${profileId}/`);
            if (response.status === 200) {
                window.location.reload(); // Refresh page after unfriending
            }
        } catch (error) {
            console.error("Error while unfriending:", error);
        }
    };

    const handleSendFriendRequest = async () => {
        try {
            await sendFriendRequest(profileId); // Call sendFriendRequest from context
        } catch (error) {
            console.error("Error while sending friend request:", error);
        }
    };

    return (
        <div className="px-3 pb-4 my-3 rounded-lg bg-base-200">
            <div className="h-32 overflow-hidden rounded-t-lg">
                <div className="h-32 rounded bg-neutral text-neutral-content">
                    {profBanner ? (
                        <img
                            className="object-cover object-top w-full h-full"
                            src={profBanner}
                            alt={`Banner-${first_name}`}
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-200"></div> // Fallback banner
                    )}
                </div>
            </div>

            <div className="relative w-32 h-32 ml-3 -mt-16 overflow-hidden border-4 border-white rounded-full">
                <div className="avatar placeholder">
                    <div className="h-32 rounded-full bg-neutral text-neutral-content">
                        {profAvatar ? (
                            <img src={profAvatar} alt={`avatar-${first_name}`} />
                        ) : (
                            <div className="flex items-center justify-center w-full h-full bg-gray-200">
                                <h2 className="text-lg font-bold">
                                    {getInitials(first_name)}
                                    {getInitials(last_name)}
                                </h2>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-between mt-2 text-left ml-36">
                <h2 className="font-semibold">{`${first_name} ${last_name}`}</h2>
                {isSelf ? (
                    <button onClick={handleEditClick} className="btn btn-primary btn-sm">
                        Edit
                    </button>
                ) : isFriend ? (
                    <button onClick={handleUnfriendClick} className="btn btn-error btn-sm">
                        Unfriend
                    </button>
                ) : incomingRequest ? (
                    <div className="flex space-x-2">
                        <button
                            onClick={() => acceptFriendRequest(incomingRequest.id)}
                            className="btn btn-primary btn-sm"
                        >
                            Accept Request
                        </button>
                        <button
                            onClick={() => rejectFriendRequest(incomingRequest.id)}
                            className="btn btn-error btn-sm"
                        >
                            Reject Request
                        </button>
                    </div>
                ) : (
                    <button onClick={handleSendFriendRequest} className="btn btn-primary btn-sm">
                        Send Friend Request
                    </button>
                )}
            </div>

            <p className="mt-1 text-sm text-gray-600 ml-36">@{username}</p>
            <p className="mt-1 text-sm text-gray-600 ml-36">{bio || "No bio available"}</p>
        </div>
    );
};

BannerProfile.propTypes = {
    first_name: PropTypes.string.isRequired,
    last_name: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    profAvatar: PropTypes.string,
    profBanner: PropTypes.string,
    bio: PropTypes.string,
    profileId: PropTypes.number, // ID of the user being viewed
    isSelf: PropTypes.bool, // Whether the profile belongs to the logged-in user
};

export default BannerProfile;
