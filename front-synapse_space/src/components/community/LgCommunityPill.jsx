import React from 'react';
import { useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';

const LgCommunityPill = ({ communityName, communityID, commAvatar}) => {
    const navigate = useNavigate();

    const getInitials = (name) => {
        return name.split(' ').map(word => word[0]).join('');
    };

    return (
        <button
            onClick={() => navigate(`/community/${communityID}`)}
            className="flex items-center w-full p-2 rounded-full group mt-3 hover:bg-gray-100 dark:hover:bg-gray-700 overflow-hidden whitespace-nowrap"
        >
            <div className="avatar placeholder">
                <div className="bg-neutral text-neutral-content w-5 rounded-full">
                    {commAvatar ? (
                        <img src={commAvatar} alt={`avatar-${communityName}`}/>
                    ) : (
                        <h2 className="text-xs font-bold">{getInitials(communityName)}</h2>
                    )}
                </div>
            </div>
            <span className="ms-3 text-ellipsis overflow-hidden whitespace-nowrap">
        {communityName}
    </span>
        </button>

    );
};

LgCommunityPill.propTypes = {
    communityName: PropTypes.string.isRequired,
    communityID: PropTypes.number.isRequired,
};

export default LgCommunityPill;