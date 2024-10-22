// src/components/UserList.js
import React from 'react';
import UserCard from './UserCard';

const UserList = ({ users = [], resultCount = 0, searchQuery }) => {
  return (
    <div className="max-w-lg mx-auto">
      {resultCount > 0 && (
        <h2 className="text-lg font-bold text-center">
          {resultCount} users for "{searchQuery}"
        </h2>
      )}
      <div className="flex flex-row gap-5 mt-4"> {/* Adjusted gap */}
        {resultCount > 0 ? (
          users.map((user) => (
            <UserCard
              key={user.id}
              name={user.first_name + " " + user.last_name}
              handle={user.username}
              img={user.profile_pic}
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
