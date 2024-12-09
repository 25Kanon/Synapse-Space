import React, { useState, useEffect, useContext, useCallback } from 'react';
import AxiosInstance from '../../utils/AxiosInstance';
import { useMemberships } from '../../context/MembershipContext';
import { useLocation } from 'react-router-dom';
import SearchBar from '../search/SearchBar';
import UserList from '../search/UserList';
import CommunityCard from '../search/CommunityCard';
import { AuthContext } from '../../context/AuthContext';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { debounce } from 'lodash';
import Loading from '../Loading';



const Search = () => {
    const [userList, setUserList] = useState([]);
    const { memberships } = useMemberships();
    const location = useLocation();
    const { query } = location.state || {}; // Access the search query from navigation state
    const [searchQuery, setSearchQuery] = useState(query || ''); // Initialize with query from state
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('communities');

    // Debounced state for triggering search
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

    // Debounce function to update search query
    const debounceSearch = useCallback(
        debounce((value) => {
            setDebouncedSearchQuery(value);
        }, 500),
        []
    );

    useEffect(() => {
        debounceSearch(searchQuery);
    }, [searchQuery, debounceSearch]);

    // Update searchQuery when navigating from another page
    useEffect(() => {
        if (query) {
            setSearchQuery(query);
        }
    }, [query]);

    // Fetch callback for communities
    const fetchCommunities = async (page) => {
        const response = await AxiosInstance.get(`/api/community/?search=${debouncedSearchQuery.trim()}&page=${page}`, {
            withCredentials: true,
        });
        return response;
    };

    // Infinite scroll for communities
    const {
        loading: communitiesLoading,
        items: communities,
        hasMore: communitiesHasMore,
        loadMore: loadMoreCommunities,
        error: communitiesError,
    } = useInfiniteScroll(fetchCommunities, [debouncedSearchQuery]);

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

    // Fetch callback for users
    const fetchUsers = async (page) => {
        const response = await AxiosInstance.get(`/api/users/?search=${debouncedSearchQuery.trim()}&page=${page}`, {
            withCredentials: true,
        });
        const filteredData = response.data.results.filter((item) => item.id !== user.id);
        response.data.results = filteredData;
        return response;
    };

    // Infinite scroll for users
    const {
        loading: usersLoading,
        items: users,
        hasMore: usersHasMore,
        loadMore: loadMoreUsers,
        error: usersError,
    } = useInfiniteScroll(fetchUsers, [debouncedSearchQuery]);

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
                        {communitiesLoading ? (
                            <><div className='w-full flex justify-center'><Loading loadingText="Searching for communities" /></div></>
                        ) : communities.length > 0 ? (
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
                            <p className="w-full text-center">No communities found.</p> // Show message if no communities after loading
                        )}
                    </div>
                )}
                {activeTab === 'users' && (
                    <div className="flex flex-wrap">
                        {usersLoading ? (
                            <>
                                <div className='w-full flex justify-center'><Loading
                                    loadingText="Searching for users"/></div>
                            </>
                        ) : users.length > 0 ? (
                            <UserList
                                users={users}
                                resultCount={users.length}
                                searchQuery={debouncedSearchQuery}
                            />
                        ) : (
                            <p className="w-full text-center">No users found.</p> // Show message if no users after loading
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

export default Search;
