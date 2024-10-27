import React from 'react';
import defaultProfilePic from '../../assets/sampleprofile1.png';
import { useFriends } from '../../context/FriendContext';
import { useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faUserFriends } from '@fortawesome/free-solid-svg-icons';

const UserCard = ({ userId, name, handle, img, isFriend }) => {
  const { friendRequests, sendFriendRequest, acceptFriendRequest, rejectFriendRequest } = useFriends();
  const { user: loggedInUser } = useContext(AuthContext);
  // Determine if a friend request has been sent by the logged-in user to this user
  const requestSent = friendRequests.some(
    (request) => request.receiver === userId && request.sender === loggedInUser.id
  );

  // Determine if there is an incoming friend request from this user to the logged-in user
  const incomingRequest = friendRequests.find(
    (request) => request.sender === userId && request.receiver === loggedInUser.id
  );
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

      {/* Conditionally render based on friendship status */}
      {isFriend ? (
        <div className="flex items-center space-x-2">
          <FontAwesomeIcon icon={faUserFriends} className="w-6 h-6 text-green-500" />
          <p className="text-green-500">Friend</p>
        </div>
      ) : requestSent ? (
        <p className="mt-2 text-sm text-gray-500">Friend Request Sent</p>
      ) : incomingRequest ? (
        <div className="flex space-x-2 mt-2">
          <button
            className="btn btn-xs btn-primary flex items-center gap-1"
            onClick={() => acceptFriendRequest(incomingRequest.id)}
          >
            <FontAwesomeIcon icon={faCheck} />
            Accept
          </button>
          <button
            className="btn btn-xs btn-error flex items-center gap-1"
            onClick={() => rejectFriendRequest(incomingRequest.id)}
          >
            <FontAwesomeIcon icon={faTimes} />
            Reject
          </button>
        </div>
      ) : (
        <button
          className="btn btn-primary mt-2"
          onClick={() => sendFriendRequest(userId)}
        >
          Send Friend Request
        </button>
      )}
    </div>
  );
};

export default UserCard;
