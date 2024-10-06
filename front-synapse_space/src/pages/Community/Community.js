import React, { useContext, useState, useEffect, useRef } from "react";
import { useParams } from 'react-router-dom';
import AuthContext from "../../context/AuthContext";
import axios from "axios";
import ErrorAlert from "../../components/ErrorAlert";
import Sidebar from "../../components/Sidebar";
import NavBar from "../../components/NavBar";
import MembersList from "../../components/community/MembersList";
import Banner from '../../components/community/Banner';
import MainContentContainer from "../../components/MainContentContainer";
import CreatePost from "../../components/community/CreatePost";
import CommunityPost from "../../components/community/CommunityPost";
import {useMemberships} from "../../context/MembershipContext";

export default function Community() {
    const API_URL = process.env.REACT_APP_API_BASE_URI;
    const { user, error } = useContext(AuthContext);
    const { id } = useParams();
    const [communityDetails, setCommunityDetails] = useState([]);
    const [posts, setPosts] = useState([]);
    const [postError, setPostError] = useState(null);
    const [hasOverflow, setHasOverflow] = useState({});

    const cardBodyRefs = useRef({}); // Object to store refs for each post

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/community/${id}/posts/`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem("access_token")}`,
                    },
                });
                setPosts(response.data);
            } catch (err) {
                setPostError(err.message);
                console.error('Error fetching posts:', err);
            }
        };

        if (communityDetails) {
            fetchPosts();
        }
    }, [id, communityDetails]);

    useEffect(() => {
        const fetchCommunityDetails = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/community/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    }
                });
                setCommunityDetails(response.data);
            } catch (error) {
                console.error('Error fetching memberships:', error);
            }
        };

        fetchCommunityDetails();
    }, [id]);

    // Check overflow for each post after they have been rendered
    useEffect(() => {
        Object.keys(cardBodyRefs.current).forEach(postId => {
            const cardBody = cardBodyRefs.current[postId];
            if (cardBody) {
                const isOverflowing = cardBody.scrollHeight > cardBody.clientHeight;
                setHasOverflow(prev => ({ ...prev, [postId]: isOverflowing }));
            }
        });
    }, [posts]);

    if (!user) {
        return (
            <div>
                <div className="hero bg-base-200 min-h-screen">
                    <p className="text-center text-xl">Welcome to Synapse Space. Please login to continue.</p>
                </div>
            </div>
        );
    }
    // if (!isMember) {
    //     return <div>Forbidden: You must be a member of this community to access this page.</div>;
    // }

    return (
        <>
            {error && <ErrorAlert text={error} classExtensions="fixed z-50" />}
            <NavBar />
            <Sidebar />
            <MembersList id={id}/>
            <MainContentContainer>
                <Banner communityName={communityDetails.name} commBanner={communityDetails.bannerURL} commAvatar={communityDetails.imgURL} />
                <CreatePost userName={user.username} community={communityDetails.id} />
                {posts.map((post) => (
                    <CommunityPost
                        key={post.id}
                        userName={post.created_by_username}
                        community={post.posted_in}
                        postTitle={post.title}
                        postContent={post.content}
                        postId={post.id}
                        hasOverflow={hasOverflow[post.id]}
                        cardBodyRef={el => (cardBodyRefs.current[post.id] = el)}
                    />
                ))}
            </MainContentContainer>
        </>
    );
}
