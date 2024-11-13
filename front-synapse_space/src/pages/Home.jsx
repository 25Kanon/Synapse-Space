import React, { useContext, useEffect, useState } from "react";
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
    const { isAuthenticated, user, error } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [isAuth, setIsAuth] = useState(false);
    const [posts, setPosts] = useState(null);
    const [Error, setError] = useState(null);



    useEffect(() => {
        const getCommunityPost = async () => {
            try {
                const response = await AxiosInstance.get(`/api/community/joined/posts/`,{},{withCredentials: true});
                setPosts(response.data);
            } catch (error) {
                setError(`Error fetching post: ${error.message}`);
            }
        };

        getCommunityPost();
    }, [isAuthenticated]);

    useEffect(() => {
        const checkAuth = async () => {
            const authStatus = await isAuthenticated();
            setIsAuth(authStatus);
            setLoading(false);
        };

        checkAuth();
    }, [isAuthenticated]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!isAuth || !user) {
        return (
            <div>
                <div className="min-h-screen hero bg-base-200">
                    <p className="text-xl text-center">Welcome to Synapse Space. Please login to continue.</p>
                    {user}
                </div>
            </div>
        );
    }

    console.log(posts)

    const fetchPosts = useCallback(async (page) => {
        return await AxiosInstance.get(`/api/community/joined/posts/?page=${page}`, 
          {}, 
          { withCredentials: true }
        );
      }, []);
    
      const { loading, items: posts, hasMore, loadMore } = useInfiniteScroll(fetchPosts);
    
      useEffect(() => {
        const handleScroll = () => {
          if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100) {
            loadMore();
          }
        };
    
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
      }, [loadMore]);

    return (
        <>
            {error || Error && <ErrorAlert text={error} classExtensions="fixed z-50" />}
            <NavBar />
            <Sidebar />
            <FriendsList />
            <MainContentContainer>
                {posts?.map((post) => (
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
                    />

                ))}
                 {loading && <div className="loading loading-spinner loading-lg"></div>}
                 {!hasMore && <div className="text-center mt-4">No more posts to load</div>}
            </MainContentContainer>
        </>
    );
}