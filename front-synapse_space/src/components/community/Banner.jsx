import React from "react";
import {Navigate, useNavigate} from "react-router-dom";
import {Globe, LockKeyhole} from "lucide-react";
import ModEntryBtn from "../community/moderator/ModEntryBtn";
import AdminEntryBtn from "../community/admin/AdminEntryBtn";

const Banner = ({ communityName, commAvatar, commBanner, communityID, communityPrivacy }) => {
    const navigate = useNavigate();
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
                            <img className="object-cover object-top h-full w-full" src={`${commBanner}`}
                                 alt={`Banner-${communityName}`}/>
                        ) : (
                            <></>
                        )}
                    </div>
                </div>

                <div className="ml-3 w-32 h-32 relative -mt-16 border-4 border-white rounded-full overflow-hidden">
                    <div className="avatar placeholder">
                        <div className="bg-neutral text-neutral-content h-32 rounded-full">
                            {commAvatar ? (
                                <img src={commAvatar} alt={`avatar-${communityName}`}/>
                            ) : (
                                <h2 className="text-lg font-bold">{getInitials(communityName)}</h2>
                            )}
                        </div>
                    </div>
                </div>

                <div className="text-left flex items-center -mt-8 ml-36">
                    <h2 className="font-semibold">{communityName}</h2>
                    <span className="ml-2">{communityPrivacy === 'public' ? (<sup><Globe size={15}/></sup>) : (
                        <sup><LockKeyhole size={15}/></sup>)}</span>
                </div>

                <div className="text-right">
                    <ModEntryBtn communityID={communityID}/>
                    <AdminEntryBtn communityID={communityID}/>
                </div>
            </div>
        </>
    );
}
export default Banner;
