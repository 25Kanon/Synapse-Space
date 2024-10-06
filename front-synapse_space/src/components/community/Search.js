import React, { useState, useEffect} from 'react';
import axios from 'axios';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { useMemberships } from '../../context/MembershipContext';
import { useLocation } from 'react-router-dom';
import JoinCommuinityBtn from "./JoinCommuinityBtn";
const Search = () => {
    const [communities, setCommunities] = useState([]);
    const { memberships} = useMemberships();
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

    const getInitials = (name) => {
        if (!name) return '';
        return name.split(' ').map(word => word[0]).join('');
    };

    return (
        <div className="flex flex-wrap">
            {communities.map((community, index) => {

                // Check if the community ID is in memberships

                const isJoined = memberships.some(membership => membership.community === community.id);
                return (
                    <div key={index} className="p-6 mx-auto">
                        {/* DaisyUI Card */}
                        <div className="card w-72 bg-base-100 shadow-xl">
                            <figure>
                                <img
                                    className="rounded-t-lg object-cover h-48 w-full"
                                    src={community.bannerURL || 'https://via.placeholder.com/150'}
                                    alt={community.name}
                                />
                            </figure>
                            <div className="card-body">
                                <div className="flex items-center mb-2">
                                    <div className="avatar placeholder mr-2">
                                        <div className="bg-base-200 text-neutral-content w-10 h-10 rounded-full">
                                            {community.imgURL ? (
                                                <img src={community.imgURL} alt={`avatar-${community.name}`} />
                                            ) : (
                                                <h2 className="text-xs font-bold">{getInitials(community.name)}</h2>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-sm font-semibold">
                                        {community.name}
                                    </p>
                                </div>
                                <h5 className="card-title text-2xl font-bold tracking-tight text-primary">{community.name}</h5>
                                <p className="mb-3 font-normal text-secondary" dangerouslySetInnerHTML={{
                                    __html: DOMPurify.sanitize(marked(community.description))
                                }} />
                                <p className="text-sm text-gray-400 mt-2">{community.name} members • {community.date}</p>
                                <div className="card-actions justify-end">{isJoined ? (
                                    <span className="text-sm text-green-500">Joined</span>
                                ) : (
                                    <JoinCommuinityBtn communityId={community.id}/>
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