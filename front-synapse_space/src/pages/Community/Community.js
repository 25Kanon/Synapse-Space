import React, { useContext, useState, useEffect } from "react";
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

export default function Community() {
    const API_URL = process.env.REACT_APP_API_BASE_URI;
    const { user, error } = useContext(AuthContext);
    const { id } = useParams();
    const [communityDetails, setCommunityDetails] = useState([]);
    const [posts, setPosts] = useState([]);
    const [PostError, setPostError] = useState(null);

    const getInitials = (name) => {
        if (!name) return '';
        return name.split(' ').map(word => word[0]).join('');
    };

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/community/${id}/posts/`);
                setPosts(response.data);
                console.log(response);
            } catch (err) {
                setPostError(err.message);
                console.error('Error fetching posts:', err);
            }
        };

        if (communityDetails) {
            fetchPosts();
        }
    }, [id]);


    useEffect(() => {
        const fetchCommunityDetails = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_BASE_URI}/api/community/${id}`, {

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


    if (!user) {
        return (
            <div>
                <div class="hero bg-base-200 min-h-screen">
                    <p class="text-center text-xl">Welcome to Synapse Space. Please login to continue.</p>
                </div>
            </div>
        );
    }
    return (
        <>
            {error && <ErrorAlert text={error} classExtensions="fixed z-50" />}
            <NavBar />
            <Sidebar />
            <MembersList />
            <MainContentContainer>
                <Banner communityName={communityDetails.name} commBanner={communityDetails.bannerURL} commAvatar={communityDetails.imgURL} />
                <CreatePost userName={user.username} community={communityDetails.id} />
                {posts.map((post) => {
                    return <CommunityPost userName={post.created_by_username} community={communityDetails.id}
                            postTitle={post.title} postContent={post.content} postId={post.id} />
                    

                })}


            </MainContentContainer>
        </>
    );
}
