import React from "react";
import { useFriends } from "../context/FriendContext"; // Adjust path as needed
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle, faClock } from "@fortawesome/free-solid-svg-icons";
import moment from "moment"; // Install moment.js for date formatting

const FriendsList = () => {
  const { friends } = useFriends();

  const isRecentlyActive = (lastActive) => {
    const fiveMinutesAgo = moment().subtract(5, "minutes");
    return moment(lastActive).isAfter(fiveMinutesAgo);
  };

  return (
    <aside
      id="sidebar"
      className="fixed top-0 right-0 w-64 pt-20 transition-transform -translate-x-full sm:translate-x-0 lg:block hidden"
      style={{ height: "95%" }}
      aria-label="Sidebar"
    >
      <div className="h-full px-3 pb-4 overflow-y-auto bg-base-200 my-3 rounded-lg">
        <p className="text-sm font-semibold">Friends</p>
        <ul className="space-y-2 font-medium">
          {friends.length > 0 ? (
            friends.map((friend) => (
              <li
                key={friend.id}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-base-100"
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
                  <span className="ms-3 text-ellipsis overflow-hidden whitespace-nowrap font-medium">
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
