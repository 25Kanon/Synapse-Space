import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';

const LgCommunityPill = ({ communityName }) => {
    const navigate = useNavigate();

    const getInitials = (name) => {
        return name.split(' ').map(word => word[0]).join('');
    };

    return (
        <button onClick={() => navigate(`/`)} className="flex items-center w-full p-2 rounded-full group mt-3   hover:bg-gray-100 dark:hover:bg-gray-700">
            <div className="avatar placeholder">
                <div className="bg-neutral text-neutral-content w-5 rounded-full">
                    <span className="text-xs">{getInitials(communityName)}</span>
                </div>
            </div>
            <span className="ms-3">{communityName}</span>
        </button>
    );
};

LgCommunityPill.propTypes = {
    communityName: PropTypes.string.isRequired,
};

export default LgCommunityPill;