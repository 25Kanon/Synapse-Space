import axios from "axios";
import React from "react";
import ErrorAlert from "../ErrorAlert";
import {useMemberships} from "../../context/MembershipContext";

const JoinCommunityBtn = ({ communityId}) => {
    const {addMembership } = useMemberships();
    const [error, setError] = React.useState(null);
    const handleJoin = async () => {
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_BASE_URI}/api/community/${communityId}/join/`,
                {}, // Adjust this as per your API requirements
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    }
                }
            );
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

    return (
        <div>
            {error && <ErrorAlert text={error} />}
            <button className="btn btn-primary" onClick={handleJoin}>Join</button>
        </div>
    );
}

export default JoinCommunityBtn;
