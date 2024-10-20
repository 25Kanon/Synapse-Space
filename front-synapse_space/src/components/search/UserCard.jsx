// src/components/UserCard.js
import React from 'react';
import defaultProfilePic from '../../assets/sampleprofile1.png';

const UserCard = ({ name, handle, img }) => {
  return (
    <div className="flex flex-col items-center p-4 space-y-2">
      <div className="w-24 h-24">
        <img
          className="w-full h-full object-cover rounded-full"
          src={img || defaultProfilePic}
          alt={`${name}'s avatar`}
        />
      </div>
      <h3 className="text-sm font-medium">{handle}</h3>
      <p className="text-xs text-gray-500">{name}</p>
    </div>
  );
};

export default UserCard;