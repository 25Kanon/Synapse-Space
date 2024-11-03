import axios from "axios";
import React, {useEffect, useState} from "react";
import ErrorAlert from "../ErrorAlert";
import {useMemberships} from "../../context/MembershipContext";
import AxiosInstance from "../../utils/AxiosInstance";

const JoinCommunityBtn = ({ communityId}) => {
    const {addMembership } = useMemberships();
    const [error, setError] = React.useState(null);
    const handleJoin = async () => {
        try {

            const response = await AxiosInstance.post(`/api/community/${communityId}/join/`,{}, { withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            // Update memberships state
            if (response.status === 201 && response.data.membership) {
                addMembership(response.data.membership);
                window.location.reload();

            }
        } catch (error) {
            console.error('Error joining community:', error);
            setError(`Error joining community: ${error.message}`);
        }
    };
    const [isPendingMembership, setIsPendingMembership] = useState(false)
    const response = async () => {
        try {
            const response = await AxiosInstance.get(`/api/membership/check-pending/${communityId}/`, {},
                { withCredentials: true});
            if (response.status === 200) {
                setIsPendingMembership(true);
            }
        } catch (error) {
            console.error('Error fetching membership status:', error);
        }
    };
     useEffect(() => {
         response();
     },[isPendingMembership, communityId]);

     if(!isPendingMembership) {
         return (
             <div>
                 {error && <ErrorAlert text={error} />}
                 <button className="btn btn-primary" onClick={handleJoin}>Join{isPendingMembership}</button>
             </div>
         );
     }
     return (
         <div>
             {error && <ErrorAlert text={error} />}
             <button className="btn btn-warning">Pending</button>
         </div>
     );
}

export default JoinCommunityBtn;
