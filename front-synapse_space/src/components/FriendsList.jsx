import React from "react";
import { useFriends } from "../context/FriendContext"; // Adjust path as needed
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle, faClock } from "@fortawesome/free-solid-svg-icons";
import moment from "moment"; // Install moment.js for date formatting
import { useNavigate } from "react-router-dom"; // Import useNavigate

const FriendsList = () => {
  const { friends } = useFriends();
  const navigate = useNavigate(); // Initialize useNavigate

  const isRecentlyActive = (lastActive) => {
    const fiveMinutesAgo = moment().subtract(5, "minutes");
    return moment(lastActive).isAfter(fiveMinutesAgo);
  };

  const handleFriendClick = (id) => {
    navigate(`/profile/user/${id}`); // Navigate to the profile URL
  };
  return (
    <aside
      id="sidebar"
      className="fixed top-0 right-0 hidden w-64 pt-20 transition-transform -translate-x-full sm:translate-x-0 lg:block"
      style={{ height: "95%" }}
      aria-label="Sidebar"
    >
      <div className="h-full px-3 pb-4 my-3 overflow-y-auto rounded-lg bg-base-200" >
        <p className="text-sm font-semibold">Friends</p>
        <ul className="space-y-2 font-medium">
          {friends.length > 0 ? (
            friends.map((friend) => (
              <li
              key={friend.id}
              className="flex items-center p-2 space-x-3 rounded-lg cursor-pointer hover:bg-base-100"
              onClick={() => handleFriendClick(friend.id)} // Add click handler
            >
              <img
                src={
                  friend.profile_pic ||
                  "https://img.daisyui.com/images/stock/default-profile.png"
                }
                alt={`${friend.full_name}'s profile`}
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <span
                  className="block overflow-hidden font-medium ms-3 text-ellipsis whitespace-nowrap"
                  style={{ maxWidth: '150px' }} // Adjust width as per your requirement
                >
                  {friend.full_name}
                </span>
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  {isRecentlyActive(friend.last_active) ? (
                    <>
                      <FontAwesomeIcon
                        icon={faCircle}
                        className="text-green-500 w-2.5 h-2.5"
                      />
                      <span className="ml-1">Online</span>
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon
                        icon={faClock}
                        className="w-3 h-3"
                      />
                      <span className="ml-1">
                        Last active: {moment(friend.last_active).fromNow()}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </li>
            
            ))
          ) : (
            <li className="text-sm text-gray-500">No friends found</li>
          )}
        </ul>
      </div>
    </aside>
  );
};

export default FriendsList;
