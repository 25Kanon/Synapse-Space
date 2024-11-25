// src/components/UserList.js
import React from 'react';
import UserCard from './UserCard';
import { useFriends } from '../../context/FriendContext'; // Import the context with friends data

const UserList = ({ users = [], resultCount = 0, searchQuery }) => {
  const { friends } = useFriends(); // Access friends from context

  return (
    <div className="max-w-full px-4 mx-auto sm:max-w-4xl"> {/* Increased max width */}
      {resultCount > 0 && (
        <h2 className="mb-4 text-lg font-bold text-center">
          {resultCount} users for "{searchQuery}"
        </h2>
      )}
      <div
        className="flex gap-5 mt-4 overflow-x-auto"
        style={{
          maxWidth: '90vw', // Set the scrollable view width dynamically
          margin: '0 auto', // Center the scrollable container
          whiteSpace: 'nowrap', // Prevent wrapping of items
          scrollbarWidth: 'thin', // For Firefox
          scrollbarColor: '#d1d5db transparent', // For Firefox
        }}
      >
        {resultCount > 0 ? (
          users.map((user) => (
            <div key={user.id} className="inline-block">
              <UserCard
                userId={user.id}
                name={`${user.first_name} ${user.last_name}`}
                handle={user.username}
                img={user.profile_pic}
                isFriend={friends.some(friend => friend.id === user.id)} // Check if the user is a friend
              />
            </div>
          ))
        ) : (
          <p className="w-full text-center">No users found.</p>
        )}
      </div>
    </div>
  );
};

export default UserList;
