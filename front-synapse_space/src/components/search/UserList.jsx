// src/components/UserList.js
import React from 'react';
import UserCard from './UserCard';
import { useFriends } from '../../context/FriendContext'; // Import the context with friends data

const UserList = ({ users = [], resultCount = 0, searchQuery }) => {
  const { friends } = useFriends(); // Access friends from context

  return (
    <div className="max-w-lg mx-auto">
      {resultCount > 0 && (
        <h2 className="text-lg font-bold text-center">
          {resultCount} users for "{searchQuery}"
        </h2>
      )}
      <div className="flex flex-row gap-5 mt-4">
        {resultCount > 0 ? (
          users.map((user) => (
            <UserCard
              key={user.id}
              userId={user.id}
              name={`${user.first_name} ${user.last_name}`}
              handle={user.username}
              img={user.profile_pic}
              isFriend={friends.some(friend => friend.id === user.id)} // Check if the user is a friend
            />
          ))
        ) : (
          <p className="text-center col-span-5">No users found.</p>
        )}
      </div>
    </div>
  );
};

export default UserList;
