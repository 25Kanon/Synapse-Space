import React from 'react';
import { useFriends } from '../context/FriendContext'; // Adjust path as needed

const FriendsList = () => {
  const { friends } = useFriends();

  return (
    <aside
      id="sidebar"
      className="fixed top-0 right-0 w-64 pt-20 transition-transform -translate-x-full sm:translate-x-0 lg:block hidden"
      style={{ height: '95%' }}
      aria-label="Sidebar"
    >
      <div className="h-full px-3 pb-4 overflow-y-auto bg-base-200 my-3 rounded-lg">
        <p className="text-sm font-semibold">Friends</p>
        <ul className="space-y-2 font-medium">
          {friends.length > 0 ? (
            friends.map(friend => (
              <li key={friend.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-base-100">
                <img
                  src={friend.profile_pic || 'https://img.daisyui.com/images/stock/default-profile.png'} // Add fallback image if needed
                  alt={`${friend.full_name}'s profile`}
                  className="w-8 h-8 rounded-full"
                />
                <span>{friend.full_name}</span>
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
