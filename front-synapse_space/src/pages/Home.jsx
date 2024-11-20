import React, { useContext, useEffect, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";
import ErrorAlert from "../components/ErrorAlert";
import Sidebar from "../components/Sidebar";
import NavBar from "../components/NavBar";
import FriendsList from "../components/FriendsList";
import MainContentContainer from "../components/MainContentContainer";
import AxiosInstance from "../utils/AxiosInstance";
import CommunityPost from "../components/community/CommunityPost";
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

export default function Home() {
    const { isAuthenticated, user, error: authError } = useContext(AuthContext);
    
    const fetchPosts = useCallback(async (page) => {
        return await AxiosInstance.get(`/api/community/joined/posts/?page=${page}`, 
            {}, 
            { withCredentials: true }
        );
    }, []);

    const { 
        loading, 
        items: feedPosts, 
        hasMore, 
        loadMore,
        error: scrollError 
    } = useInfiniteScroll(fetchPosts);

    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100) {
                loadMore();
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [loadMore]);

    if (!user) {
        return (
            <div className="min-h-screen hero bg-base-200">
                <p className="text-xl text-center">
                    Welcome to Synapse Space. Please login to continue.
                </p>
            </div>
        );
    }

    return (
        <>
            {(authError || scrollError) && 
                <ErrorAlert 
                    text={authError || scrollError} 
                    classExtensions="fixed z-50" 
                />
            }
            <NavBar />
            <Sidebar />
            <FriendsList />
            <MainContentContainer>
                {feedPosts?.map((post) => (
                    <CommunityPost
                        key={post.id}
                        userName={post.created_by_username}
                        community={post.posted_in}
                        postTitle={post.title}
                        postContent={post.content}
                        postId={post.id}
                        userID={user.id}
                        authorId={post.created_by}
                        userAvatar={post.userAvatar}
                        createdAt={post.created_at}
                    />
                ))}
                {loading && <div className="loading loading-spinner loading-lg"></div>}
                {!hasMore && <div className="text-center mt-4">No more posts to load</div>}
            </MainContentContainer>
        </>
    );
}