import React, { useState, useEffect, useRef } from "react";
import CommunityPost from "../../components/community/CommunityPost";
import axios from "axios";
import { useParams } from "react-router-dom";
import ErrorAlert from "../../components/ErrorAlert";
import NavBar from "../../components/NavBar";
import Sidebar from "../../components/Sidebar";
import MembersList from "../../components/community/MembersList";
import MainContentContainer from "../../components/MainContentContainer";

const GetCommunityPost = () => {
    const API_URL = process.env.REACT_APP_API_BASE_URI;
    const { community_id, post_id } = useParams();
    const [post, setPost] = useState(null);
    const [error, setError] = useState(null);
    const [hasOverflow, setHasOverflow] = useState({});

    const cardBodyRefs = useRef({}); // Object to store refs for each post

    useEffect(() => {
        const getCommunityPost = async () => {
            try {
                const response = await axios.get(
                    `${API_URL}/api/community/${community_id}/post/${post_id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                        },
                    }
                );
                setPost(response.data);
            } catch (error) {
                setError(`Error fetching post: ${error.message}`);
            }
        };

        getCommunityPost();
    }, [API_URL, community_id, post_id]);

    useEffect(() => {
        if (post && cardBodyRefs.current[post.id]) {
            const cardBody = cardBodyRefs.current[post.id];
            const isOverflowing = cardBody.scrollHeight > cardBody.clientHeight;
            setHasOverflow({ [post.id]: isOverflowing });
        }
    }, [post]);

    return (
        <>
            {error && <ErrorAlert text={error} classExtensions="fixed z-50" />}
            <NavBar />
            <Sidebar />
            <MembersList />
            <MainContentContainer>
                {post ? (
                    <CommunityPost
                        key={post.id}
                        userName={post.created_by_username}
                        community={post.posted_in}
                        postTitle={post.title}
                        postContent={post.content}
                        postId={post.id}
                        hasOverflow={false}
                        isExpanded={true}
                        cardBodyRef={(el) => (cardBodyRefs.current[post.id] = el)}
                    />
                ) : (
                    <h2>Post does not exist</h2>
                )}
            </MainContentContainer>
        </>
    );
};

export default GetCommunityPost;
