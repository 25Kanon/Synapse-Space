import React from "react";
import PropTypes from "prop-types";

const Banner = ({ profAvatar, profBanner, profName }) => {
    return (
        <div className="relative w-full bg-gray-300 rounded-lg">
            {/* Profile Banner */}
            <div className="h-32 overflow-hidden rounded-t-lg">
                {profBanner ? (
                    <img
                        src={profBanner}
                        alt="Profile Banner"
                        className="object-cover w-full h-full"
                    />
                ) : (
                    <div className="h-full bg-gray-400"></div>
                )}
            </div>
            {/* Profile Avatar */}
            <div className="absolute w-24 h-24 overflow-hidden bg-gray-400 border-4 border-white rounded-full top-20 left-4">
                {profAvatar ? (
                    <img
                        src={profAvatar}
                        alt="Profile Avatar"
                        className="object-cover w-full h-full"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-400"></div>
                )}
            </div>
        </div>
    );
};

Banner.propTypes = {
    profAvatar: PropTypes.string,
    profBanner: PropTypes.string,
    profName: PropTypes.string,
};

export default Banner;
