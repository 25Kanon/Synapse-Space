import React, { useState, useEffect, useContext, useCallback } from 'react';
import AxiosInstance from '../../utils/AxiosInstance';
import { useMemberships } from '../../context/MembershipContext';
import { useLocation } from 'react-router-dom';
import SearchBar from '../search/SearchBar';
import UserList from '../search/UserList';
import CommunityCard from '../search/CommunityCard';
import { AuthContext } from '../../context/AuthContext';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
const Search = () => {
    // const [communities, setCommunities] = useState([]);
    const [userList, setUserList] = useState([]);
    const { memberships } = useMemberships();
    const location = useLocation();
    const { query } = location.state || {}; // Access the search query
    const [searchQuery, setSearchQuery] = useState(query);
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('communities'); // State for active tab


    // Fetch callback for communities to be used with useInfiniteScroll hook
    const fetchCommunities =
        async (page) => {
            const response = await AxiosInstance.get(`/api/community/?search=${searchQuery.trim()}&page=${page}`, {
                withCredentials: true,
            });
            return response;
        };
    // Use useInfiniteScroll hook for communities
    const {
        loading: communitiesLoading,
        items: communities,
        hasMore: communitiesHasMore,
        loadMore: loadMoreCommunities,
        error: communitiesError,
    } = useInfiniteScroll(fetchCommunities, [searchQuery]);

    // Infinite scroll event listener for loading more communities
    useEffect(() => {
        if (activeTab === 'communities') {
            const handleScroll = () => {
                if (
                    window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100 &&
                    !communitiesLoading &&
                    communitiesHasMore
                ) {
                    loadMoreCommunities();
                }
            };

            window.addEventListener('scroll', handleScroll);
            return () => window.removeEventListener('scroll', handleScroll);
        }
    }, [loadMoreCommunities, communitiesLoading, communitiesHasMore, activeTab]);


    // Fetch callback for users to be used with useInfiniteScroll hook
    const fetchUsers =
        async (page) => {
            const response = await AxiosInstance.get(`/api/users/?search=${searchQuery.trim()}&page=${page}`, {
                withCredentials: true,
            });
            const filteredData = response.data.results.filter((item) => item.id !== user.id);
            response.data.results = filteredData;
            return response;
        };

    // Use useInfiniteScroll hook for users
    const {
        loading: usersLoading,
        items: users,
        hasMore: usersHasMore,
        loadMore: loadMoreUsers,
        error: usersError,
    } = useInfiniteScroll(fetchUsers, [searchQuery]);

    // Infinite scroll event listener for loading more users
    useEffect(() => {
        if (activeTab === 'users') {
            const handleScroll = () => {
                if (
                    window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100 &&
                    !usersLoading &&
                    usersHasMore
                ) {
                    loadMoreUsers();
                }
            };

            window.addEventListener('scroll', handleScroll);
            return () => window.removeEventListener('scroll', handleScroll);
        }
    }, [loadMoreUsers, usersLoading, usersHasMore, activeTab]);
    const getInitials = (name) => {
        if (!name) return '';
        return name.split(' ').map(word => word[0]).join('');
    };

    return (
        <>
            <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            <div className="tabs">
                <button
                    className={`tab tab-bordered ${activeTab === 'communities' ? 'tab-active bg-primary text-white' : ''}`}
                    onClick={() => setActiveTab('communities')}
                >
                    Communities
                </button>
                <button
                    className={`tab tab-bordered ${activeTab === 'users' ? 'tab-active bg-primary text-white' : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    Users
                </button>
            </div>

            <div className="mt-4">
                {activeTab === 'communities' && (
                    <div className="flex flex-wrap">
                        {communities.length > 0 ? (
                            communities.map((community, index) => {
                                const isJoined = memberships.some(
                                    (membership) => membership.community === community.id
                                );
                                return (
                                    <CommunityCard
                                        key={index}
                                        community={community}
                                        getInitials={getInitials}
                                        isJoined={isJoined}
                                    />
                                );
                            })
                        ) : (
                            <p className="w-full text-center">No communities found.</p>
                        )}

                    </div>
                )}
                {activeTab === 'users' && (
                    <div className="flex flex-wrap">
                        <UserList
                            users={users}
                            resultCount={users.length}
                            searchQuery={searchQuery}
                        />
                    </div>
                )}
            </div>
        </>
    );

}

export default Search;