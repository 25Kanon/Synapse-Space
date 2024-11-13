import React, { useContext, useState, useEffect, useCallback } from "react";
import { useParams } from 'react-router-dom';
import AuthContext from "../../context/AuthContext";
import AxiosInstance from "../../utils/AxiosInstance";
import ErrorAlert from "../../components/ErrorAlert";
import Sidebar from "../../components/Sidebar";
import NavBar from "../../components/NavBar";
import MembersList from "../../components/community/MembersList";
import Banner from '../../components/community/Banner';
import MainContentContainer from "../../components/MainContentContainer";
import CreatePost from "../../components/community/CreatePost";
import CommunityPost from "../../components/community/CommunityPost";
import JoinCommunityBtn from "../../components/community/JoinCommuinityBtn";
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';

export default function Community() {
    const { user, error: authError } = useContext(AuthContext);
    const { id } = useParams();
    const [isMember, setIsMember] = useState(false);

    const fetchCommunityPosts = useCallback(async (page) => {
        return await AxiosInstance.get(`/api/community/${id}/posts/?page=${page}`, 
            {}, 
            { withCredentials: true }
        );
    }, [id]);

    const { 
        loading, 
        items: communityPosts, 
        hasMore, 
        loadMore,
        error: scrollError 
    } = useInfiniteScroll(fetchCommunityPosts);

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
            {(authError || scrollError) && 
                <ErrorAlert 
                    text={authError || scrollError} 
                    classExtensions="fixed z-50" 
                />
            }
            <NavBar />
            <Sidebar />
            <Banner />
            <JoinCommunityBtn isMember={isMember} setIsMember={setIsMember} />
            <MainContentContainer>
                {isMember && <CreatePost />}
                {communityPosts?.map((post) => (
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
            <MembersList />
        </>
    );
}