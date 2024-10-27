import React from "react";
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const BannerProfile = ({ first_name, profAvatar, profBanner, bio }) => {
    const navigate = useNavigate(); // Initialize useNavigate

    const getInitials = (first_name) => {
        return first_name ? first_name[0] : '';
    };

    const handleEditClick = () => {
        navigate("/edit-profile"); // Navigate to edit profile page
    };

    return (
        <div className="px-3 pb-4 my-3 rounded-lg bg-base-200">
            <div className="h-32 overflow-hidden rounded-t-lg">
                <div className="h-32 rounded bg-neutral text-neutral-content">
                    {profBanner ? (
                        <img className="object-cover object-top w-full h-full" src={profBanner} alt={`Banner-${first_name}`} />
                    ) : null}
                </div>
            </div>

            <div className="relative w-32 h-32 ml-3 -mt-16 overflow-hidden border-4 border-white rounded-full">
                <div className="avatar placeholder">
                    <div className="h-32 rounded-full bg-neutral text-neutral-content">
                        {profAvatar ? (
                            <img src={profAvatar} alt={`avatar-${first_name}`} />
                        ) : (
                            <h2 className="text-lg font-bold">{getInitials(first_name)}</h2>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between mt-2 text-left ml-36">
                <h2 className="font-semibold">{first_name}</h2>
                <button onClick={handleEditClick} className="btn btn-primary btn-sm">Edit</button>
            </div>

            <p className="mt-1 text-sm text-gray-600 ml-36">{bio || 'No bio available'}</p>
        </div>
    );
};

BannerProfile.propTypes = {
    first_name: PropTypes.string.isRequired,
    profAvatar: PropTypes.string,
    profBanner: PropTypes.string,
    bio: PropTypes.string,
};

export default BannerProfile;
