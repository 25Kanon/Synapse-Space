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
      <div className="transition-transform transform shadow-xl cursor-pointer card w-72 bg-base-100 hover:scale-105 hover:shadow-2xl" onClick={handleCardClick}>
        <figure>
          <img
            className="object-cover w-full h-48 rounded-t-lg"
            src={community.bannerURL || 'https://via.placeholder.com/150'}
            alt={community.name}
          />
        </figure>
        <div className="card-body">
          <div className="flex items-center mb-2">
            <div className="mr-2 avatar placeholder">
              <div className="w-10 h-10 rounded-full bg-base-200 text-neutral-content">
                {community.imgURL ? (
                    <img src={community.imgURL} alt={`avatar-${community.name}`}/>
                ) : (
                    <h2 className="text-xs font-bold">{getInitials(community.name)}</h2>
                )}
              </div>
            </div>
            <p className="text-sm font-semibold">
              {community.name}
            </p>
          </div>
          {community.similarity_score ? (
              <p className="text-sm font-semibold text-green-500">
                Similarity Score: {(community.similarity_score * 100).toFixed(2)}%
              </p>
          ) : (<></>)}
          <h5 className="text-2xl font-bold tracking-tight card-title text-primary">{community.name}</h5>
          <p className="mb-3 font-normal text-secondary" dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(marked(community.description))
          }}/>
          <p className="mt-2 text-sm text-gray-400">{community.name} members • {community.date}</p>
          <div className="justify-end card-actions">
            {isJoined ? (
                <span className="text-sm text-green-500">Joined</span>
            ) : (
                <JoinCommuinityBtn communityId={community.id}/>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityCard;