import React, { createContext, useState, useEffect, useContext } from 'react';
import AxiosInstance from '../utils/AxiosInstance';
import AuthContext from './AuthContext';

// Create the FriendContext
const FriendContext = createContext();

// Provider component
export const FriendProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [friendRequests, setFriendRequests] = useState([]);
    const [filteredFriendRequests, setFilteredFriendRequests] = useState([]);
    const [friends, setFriends] = useState([]);
    // Fetch friend requests
    const fetchFriendRequests = () => {
        if (user?.id) {
            AxiosInstance.get('/api/friend-requests/', { withCredentials: true })
                .then(response => {
                    setFriendRequests(response.data);
                })
                .catch(error => console.error('Error fetching friend requests:', error));
        }
    };

    // Filter friend requests directed at the logged-in user
    useEffect(() => {
        if (friendRequests && user?.id) {
            const filteredRequests = friendRequests.filter(request => request.receiver === user.id && request.status === 'pending');
            setFilteredFriendRequests(filteredRequests);
        }
    }, [friendRequests, user?.id]);

    // Poll for friend requests every minute
    useEffect(() => {
        fetchFriendRequests();
        const intervalId = setInterval(fetchFriendRequests, 30000);
        return () => clearInterval(intervalId);
    }, []);

    // Fetch friends
    const fetchFriends = () => {
        if (user?.id) {
            AxiosInstance.get('/api/friends/', { withCredentials: true })
                .then(response => setFriends(response.data))
                .catch(error => console.error('Error fetching friends:', error));
        }
    };

    // Poll for friends list every minute
    useEffect(() => {
        fetchFriends();
        const intervalId = setInterval(fetchFriends, 30000);
        return () => clearInterval(intervalId);
    }, []);

    // Send friend request
    const sendFriendRequest = (userId) => {
        AxiosInstance.post('/api/friend/send-request/', { receiver: userId }, { withCredentials: true })
            .then(fetchFriendRequests)
            .catch(error => console.error('Error sending friend request:', error));
    };

    // Accept friend request
    const acceptFriendRequest = (requestId) => {
        AxiosInstance.patch(`/api/respond-request/${requestId}/`, { action: 'accept' }, { withCredentials: true })
            .then(() => {
                setFriendRequests(prevRequests => prevRequests.filter(request => request.id !== requestId));
                fetchFriends(); // Update friends list after accepting
            })
            .catch(error => console.error('Error accepting friend request:', error));
    };

    // Reject friend request
    const rejectFriendRequest = (requestId) => {
        AxiosInstance.patch(`/api/respond-request/${requestId}/`, { action: 'reject' }, { withCredentials: true })
            .then(() => {
                setFriendRequests(prevRequests => prevRequests.filter(request => request.id !== requestId));
            })
            .catch(error => console.error('Error rejecting friend request:', error));
    };

    return (
        <FriendContext.Provider value={{
            friends, friendRequests, filteredFriendRequests,
            fetchFriends, sendFriendRequest, acceptFriendRequest, rejectFriendRequest,
        }}>
            {children}
        </FriendContext.Provider>
    );
};

// Custom hook for using the FriendContext
export const useFriends = () => useContext(FriendContext);
