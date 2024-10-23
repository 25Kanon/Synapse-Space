import React from "react";
import PropTypes from 'prop-types';

const BannerProfile = ({ first_name, last_name, profAvatar, profBanner }) => {
    const getInitials = (first_name, last_name) => {
        if (!first_name || !last_name) return '';
        return `${first_name[0]}${last_name[0]}`;
    };

    return (
        <>
            <div className="px-3 pb-4 my-3 rounded-lg bg-base-200">
                <div className="h-32 overflow-hidden rounded-t-lg">
                    <div className="h-32 rounded bg-neutral text-neutral-content">
                        {profBanner ? (
                            <img className="object-cover object-top w-full h-full" src={profBanner} alt={`Banner-${first_name} ${last_name}`} />
                        ) : (
                            <></>
                        )}
                    </div>
                </div>

                <div className="relative w-32 h-32 ml-3 -mt-16 overflow-hidden border-4 border-white rounded-full">
                    <div className="avatar placeholder">
                        <div className="h-32 rounded-full bg-neutral text-neutral-content">
                            {profAvatar ? (
                                <img src={profAvatar} alt={`avatar-${first_name} ${last_name}`} />
                            ) : (
                                <h2 className="text-lg font-bold">{getInitials(first_name, last_name)}</h2>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-2 text-left ml-36">
                    <h2 className="font-semibold">{`${first_name} ${last_name}`}</h2>
                    <button className="btn btn-primary btn-sm">Edit</button>
                </div>
            </div>
        </>
    );
};

BannerProfile.propTypes = {
    first_name: PropTypes.string.isRequired,
    last_name: PropTypes.string.isRequired,
    profAvatar: PropTypes.string,
    profBanner: PropTypes.string,
};

export default BannerProfile;
