import React, { useState, useEffect, useContext} from "react";
import CommunityPost from "../../components/community/CommunityPost";
import AxiosInstance from "../../utils/AxiosInstance";
import { useParams } from "react-router-dom";
import ErrorAlert from "../../components/ErrorAlert";
import NavBar from "../../components/NavBar";
import Sidebar from "../../components/Sidebar";
import MembersList from "../../components/community/MembersList";
import MainContentContainer from "../../components/MainContentContainer";
import { AuthContext } from "../../context/AuthContext";
import { tuple } from "yup";

const GetCommunityPost = () => {
    const API_URL = import.meta.env.VITE_API_BASE_URI;
    const { community_id, post_id } = useParams();
    const [post, setPost] = useState(null);
    const [error, setError] = useState(null);
    const { user } = useContext(AuthContext);
    useEffect(() => {
        const getCommunityPost = async () => {
            try {
                const response = await AxiosInstance.get(
                    `/api/community/${community_id}/post/${post_id}`,{},{withCredentials: true}
                );
                setPost(response.data);
            } catch (error) {
                setError(`Error fetching post: ${error.message}`);
            }
        };

        getCommunityPost();
    }, [API_URL, community_id, post_id]);


    return (
        <>
            {error && <ErrorAlert text={error} classExtensions="fixed z-50" />}
            <NavBar />
            <Sidebar />
            <MembersList id={community_id} />
            <MainContentContainer>
                {post ? (
                    <CommunityPost
                        key={post.id}
                        userName={post.created_by_username}
                        community={post.posted_in}
                        postTitle={post.title}
                        postContent={post.content}
                        postId={post.id}
                        showComments={true}
                        userID={user.id}
                        authorId={post.created_by}
                    />
                ) : (
                    <h2>Post does not exist</h2>
                )}
            </MainContentContainer>
        </>
    );
};

export default GetCommunityPost;
