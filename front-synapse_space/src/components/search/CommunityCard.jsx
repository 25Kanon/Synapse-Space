import React from 'react';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import JoinCommuinityBtn from '../community/JoinCommuinityBtn';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react'
import AxiosInstance from "../../utils/AxiosInstance";


const CommunityCard = ({ community, getInitials, isJoined, isRecommendation }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/community/${community.id}`);
  };

  const notInterested = async () => {

    try {
      const handleNotInterested = await AxiosInstance.post(`api/not-interested/`, {"community_id": community.id}, {withCredentials: true})
        if (handleNotInterested.status === 200 || handleNotInterested.status === 201)
          window.location.reload();
    } catch (error) {
      console.error('Error:', error);
    }

  };

  return (
    <>
      <div className="p-4 w-full sm:w-1/2 lg:w-1/3 xl:w-1/4" style={{ minWidth: '250px' }}>
        <div
          className="relative transition-transform transform shadow-lg cursor-pointer card bg-base-100 hover:scale-105 hover:shadow-xl h-full flex flex-col"
        >
          <figure className="relative h-48">
            <img
              className="object-cover w-full h-full rounded-t-lg"
              src={community.bannerURL || 'https://via.placeholder.com/300x150?text=No+Banner'}
              alt={community.name}
            />
          </figure>

          {isRecommendation &&(
          <div className="absolute top-2 right-2">
            <div
              className="tooltip tooltip-top rounded-full w-10 h-10 flex items-center justify-center bg-primary shadow-lg"
              data-tip={community.reason}
            >

                  <div className="indicator">
                <span className="indicator-item badge badge-primary text-accent">
                  <Sparkles size={21}/>
                </span>
              </div>

            </div>
          </div>)}

          {isRecommendation &&(
              <div className="absolute top-2 left-2">
                <button className="btn btn-circle btn-erro" onClick={notInterested}>
                  <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>)}

          <div className="card-body flex flex-col flex-grow p-4">
            <div className="flex items-center mb-2">
              <div className="avatar placeholder mr-2">
                <div className="w-10 h-10 rounded-full bg-base-200 text-neutral-content">
                  {community.imgURL ? (
                      <img
                          src={community.imgURL}
                          alt={`avatar-${community.name}`}
                          className="rounded-full"
                      />
                  ) : (
                      <span className="text-xs font-bold">{getInitials(community.name)}</span>
                  )}
                </div>
              </div>
              <p className="text-sm font-semibold truncate" title={community.name} onClick={handleCardClick}>
                {community.name}
              </p>
            </div>
            {community.similarity_score && (
                <p className="text-sm font-semibold text-green-500 mb-2">
                  Similarity Score: {(community.similarity_score * 100).toFixed(2)}%
                </p>
            )}
            <h5
                className="text-xl font-bold tracking-tight card-title text-primary truncate"
                title={community.name}
            >
              {community.name}
            </h5>
            <p
                className="mb-3 text-sm text-gray-600 line-clamp-3"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(marked(community.description)),
                }}
            />
            {/*<p className="mt-2 text-xs text-gray-400">*/}
            {/*  {community.member_count} {community.member_count === 1 ? "member" : "members"} • {community.date}*/}
            {/*</p>*/}
            <div className="justify-end card-actions mt-auto">

              {isJoined ? (
                  <span className="text-sm text-green-500">Joined</span>
              ) : (
                  <JoinCommuinityBtn communityId={community.id}/>
              )}
            </div>
          </div>
        </div>
      </div>

    </>

  );
};

export default CommunityCard;
