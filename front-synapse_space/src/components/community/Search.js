import React, { useState, useEffect } from 'react';
import AxiosInstance from 'utils/AxiosInstance';
import { useMemberships } from '../../context/MembershipContext';
import { useLocation } from 'react-router-dom';
import SearchBar from '../search/SearchBar';
import UserList from '../search/UserList';
import CommunityCard from 'components/search/CommunityCard';
const Search = () => {
    const [communities, setCommunities] = useState([]);
    const [userList, setUserList] = useState([]);
    const { memberships } = useMemberships();
    const location = useLocation();
    const { query } = location.state || {}; // Access the search query
    const [searchQuery, setSearchQuery] = useState(query);

    useEffect(() => {
        const delay = 300; // Delay in milliseconds
        const handler = setTimeout(() => {
            if (searchQuery) {
                AxiosInstance.get(`/api/community?search=` + searchQuery.trim(), { withCredentials: true })
                    .then(response => {
                        setCommunities(response.data);
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
            } else {
                setCommunities([]); // Clear communities if searchQuery is empty
            }
        }, delay);

        // Cleanup function to clear the timeout if the component unmounts or searchQuery changes
        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery]);


    useEffect(() => {
        const delay = 300; // Delay in milliseconds
        const handler = setTimeout(() => {
            if (searchQuery) {
                AxiosInstance.get(`/api/users/?search=` + searchQuery.trim(), { withCredentials: true })
                    .then(response => {
                        setUserList(response.data);
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
            } else {
                setUserList([]); // Clear communities if searchQuery is empty
            }
        }, delay);

        // Cleanup function to clear the timeout if the component unmounts or searchQuery changes
        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery]);

    const getInitials = (name) => {
        if (!name) return '';
        return name.split(' ').map(word => word[0]).join('');
    };

    return (
        <>
            <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            <div className="flex flex-wrap">
                {communities.map((community, index) => {

                    // Check if the community ID is in memberships
                    const isJoined = memberships.some(membership => membership.community === community.id);
                    return (
                        <CommunityCard
                            key={index}
                            community={community}
                            getInitials={getInitials}
                            isJoined={isJoined}
                        />
                    )
                }

                )}
            </div>
            {userList.length > 0 && communities.length >0 && <hr />} {/* Horizontal line divider */}
            <div className="flex flex-wrap">
                <UserList users={userList} resultCount={userList.length} searchQuery={searchQuery} />
            </div>
        </>
    );

}

export default Search;