import React from 'react';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import JoinCommuinityBtn from '../community/JoinCommuinityBtn';
import { useNavigate } from 'react-router-dom';

const CommunityCard = ({ community, getInitials, isJoined }) => {
  const navigate = useNavigate();
  const handleCardClick = () => {
    navigate(`/community/${community.id}`);
  };
  return (
    <div className="p-6 mx-auto">
      {/* DaisyUI Card */}
      <div className="card w-72 bg-base-100 shadow-xl cursor-pointer transform transition-transform hover:scale-105 hover:shadow-2xl" onClick={handleCardClick}>
        <figure>
          <img
            className="rounded-t-lg object-cover h-48 w-full"
            src={community.bannerURL || 'https://via.placeholder.com/150'}
            alt={community.name}
          />
        </figure>
        <div className="card-body">
          <div className="flex items-center mb-2">
            <div className="avatar placeholder mr-2">
              <div className="bg-base-200 text-neutral-content w-10 h-10 rounded-full">
                {community.imgURL ? (
                  <img src={community.imgURL} alt={`avatar-${community.name}`} />
                ) : (
                  <h2 className="text-xs font-bold">{getInitials(community.name)}</h2>
                )}
              </div>
            </div>
            <p className="text-sm font-semibold">
              {community.name}
            </p>
          </div>
          <h5 className="card-title text-2xl font-bold tracking-tight text-primary">{community.name}</h5>
          <p className="mb-3 font-normal text-secondary" dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(marked(community.description))
          }} />
          <p className="text-sm text-gray-400 mt-2">{community.name} members • {community.date}</p>
          <div className="card-actions justify-end">
            {isJoined ? (
              <span className="text-sm text-green-500">Joined</span>
            ) : (
              <JoinCommuinityBtn communityId={community.id} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityCard;