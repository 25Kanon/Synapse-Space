import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { useMemberships } from 'context/MembershipContext';
import { useLocation } from 'react-router-dom';
const Search = () => {
    const [communities, setCommunities] = useState([]);
    const { memberships, addMembership } = useMemberships();
    const location = useLocation();
    const { query } = location.state || {}; // Access the search query
    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_BASE_URI}/api/community?search=` + query,
            {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                }
            })
            .then(response => {
                setCommunities(response.data);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }, [query]);

    // Function to handle joining a community
    const handleJoin = async (communityId) => {
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
            }
        } catch (error) {
            console.error('Error joining community:', error);
        }
    };

    const [searchTerm, setSearchTerm] = useState('');
    return (
        <div className="flex flex-wrap">
            {communities.map((community, index) => {

                // Check if the community ID is in memberships

                const isJoined = memberships.some(membership => membership.community === community.id);
                return (
                    <div key={index} className="p-6">
                        {/* DaisyUI Card */}
                        <div className="card w-96 bg-base-100 shadow-xl">
                            <figure>
                                <img
                                    className="rounded-t-lg"
                                    src={community.bannerUrl || 'https://via.placeholder.com/150'}
                                    alt={community.name}
                                />
                            </figure>
                            <div className="card-body">
                                <div className="flex items-center mb-2">
                                    <div className="avatar mr-2">
                                        <div className="rounded-full h-7 w-7">
                                            <img
                                                src={community.imgUrl || 'https://via.placeholder.com/50'}
                                                alt={community.name}
                                                className="rounded-full h-7 w-7"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-sm font-semibold">
                                        {community.name}
                                    </p>
                                </div>
                                <h5 className="card-title text-2xl font-bold tracking-tight text-gray-900">{community.name}</h5>
                                <p className="mb-3 font-normal text-gray-700" dangerouslySetInnerHTML={{
                                    __html: DOMPurify.sanitize(marked(community.description))
                                }} />
                                <p className="text-sm text-gray-400 mt-2">{community.name} members • {community.date}</p>
                                <div className="card-actions justify-end">{isJoined ? (
                                    <span className="text-sm text-green-500">Joined</span>
                                ) : (
                                    <button className="btn btn-primary" onClick={() => handleJoin(community.id)}>Join</button>
                                )}
                                </div>
                            </div>
                        </div>
                    </div>)
            }

            )}
        </div>
    );

}

export default Search;