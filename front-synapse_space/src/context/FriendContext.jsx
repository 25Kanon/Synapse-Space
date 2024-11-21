import React, { createContext, useState, useEffect, useContext } from 'react';
import AxiosInstance from '../utils/AxiosInstance';
import AuthContext from './AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FriendContext = createContext();

export const FriendProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [friendRequests, setFriendRequests] = useState([]);
    const [filteredFriendRequests, setFilteredFriendRequests] = useState([]);
    const [friends, setFriends] = useState([]);

    const fetchFriendRequests = () => {
        if (user?.id) {
            AxiosInstance.get('/api/friend-requests/', { withCredentials: true })
                .then(response => {
                    setFriendRequests(response.data);
                })
                .catch(error => {
                    console.error('Error fetching friend requests:', error);
                    toast.error('Failed to fetch friend requests.');
                });
        }
    };

    useEffect(() => {
        if (friendRequests && user?.id) {
            const filteredRequests = friendRequests.filter(request => request.receiver === user.id && request.status === 'pending');
            setFilteredFriendRequests(filteredRequests);
        }
    }, [friendRequests, user?.id]);

    useEffect(() => {
        fetchFriendRequests();
        const intervalId = setInterval(fetchFriendRequests, 30000);
        return () => clearInterval(intervalId);
    }, [user?.id]);

    const fetchFriends = () => {
        if (user?.id) {
            AxiosInstance.get('/api/friends/', { withCredentials: true })
                .then(response => setFriends(response.data))
                .catch(error => {
                    console.error('Error fetching friends:', error);
                    toast.error('Failed to fetch friends list.');
                });
        }
    };

    useEffect(() => {
        fetchFriends();
        const intervalId = setInterval(fetchFriends, 30000);
        return () => clearInterval(intervalId);
    }, [user?.id]);

    const sendFriendRequest = (userId) => {
        AxiosInstance.post('/api/friend/send-request/', { receiver: userId }, { withCredentials: true })
            .then(() => {
                toast.success('Friend request sent successfully.');
                fetchFriendRequests();
            })
            .catch(error => {
                console.error('Error sending friend request:', error);
                toast.error('Failed to send friend request.');
            });
    };

    const acceptFriendRequest = (requestId) => {
        AxiosInstance.patch(`/api/respond-request/${requestId}/`, { action: 'accept' }, { withCredentials: true })
            .then(() => {
                toast.success('Friend request accepted.');
                setFriendRequests(prevRequests => prevRequests.filter(request => request.id !== requestId));
                fetchFriends();
            })
            .catch(error => {
                console.error('Error accepting friend request:', error);
                toast.error('Failed to accept friend request.');
            });
    };

    const rejectFriendRequest = (requestId) => {
        AxiosInstance.patch(`/api/respond-request/${requestId}/`, { action: 'reject' }, { withCredentials: true })
            .then(() => {
                toast.success('Friend request rejected.');
                setFriendRequests(prevRequests => prevRequests.filter(request => request.id !== requestId));
            })
            .catch(error => {
                console.error('Error rejecting friend request:', error);
                toast.error('Failed to reject friend request.');
            });
    };

    return (
        <FriendContext.Provider value={{
            friends,
            friendRequests,
            filteredFriendRequests,
            fetchFriends,
            sendFriendRequest,
            acceptFriendRequest,
            rejectFriendRequest,
        }}>
            {children}
        </FriendContext.Provider>
    );
};

export const useFriends = () => useContext(FriendContext);
