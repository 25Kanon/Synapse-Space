import React from "react";

const Banner = ({ communityName, commAvatar, commBanner }) => {
    const getInitials = (name) => {
        if (!name) return '';
        return name.split(' ').map(word => word[0]).join('');
    };

    return (
        <>
            <div className="px-3 pb-4  bg-base-200 my-3 rounded-lg">
                <div className="rounded-t-lg h-32 overflow-hidden">
                    <div className="bg-neutral text-neutral-content rounded h-32">
                            {commBanner ? (
                                <img className="object-cover object-top h-full w-full" src={`${commBanner}`} alt={`Banner-${communityName}`} />
                            ) : (
                               <></>
                            )}
                        </div>
                </div>

                <div className="ml-3 w-32 h-32 relative -mt-16 border-4 border-white rounded-full overflow-hidden">
                    <div className="avatar placeholder">
                        <div className="bg-neutral text-neutral-content h-32 rounded-full">
                            {commAvatar ? (
                                <img src={commAvatar} alt={`avatar-${communityName}`} />
                            ) : (
                                <h2 className="text-lg font-bold">{getInitials(communityName)}</h2>
                            )}
                        </div>
                    </div>
                    {/* <img className="object-cover object-center h-32" src='https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjE0NTg5fQ' alt='Woman looking front' /> */}
                </div>

                <div className="text-left">
                    <h2 className="font-semibold -mt-8 ml-36">{communityName}</h2>
                </div>
            </div>
        </>
    );
}
export default Banner;
