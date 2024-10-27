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
import JoinCommuinityBtn from "../../components/community/JoinCommuinityBtn";
import AxiosInstance from "../../utils/AxiosInstance";

export default function Community() {
    const API_URL = import.meta.env.VITE_API_BASE_URI;
    const { user, error } = useContext(AuthContext);
    const { id } = useParams();
    const [isMember, setIsMember] = useState(false);
    const [communityDetails, setCommunityDetails] = useState([]);
    const [posts, setPosts] = useState([]);
    const [Error, setError] = useState(null);
    const [postCreated, setPostCreated] = useState(false);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await AxiosInstance.get(`/api/community/${id}/posts/`, {}, { withCredentials: true,});
                setIsMember(true)
                setPosts(response.data);
                console.log("posts:", response.data);
                setPostCreated(false);
            } catch (err) {
                if (err.response.status === 403) {
                    setIsMember(false);
                } else {
                    setError(err.message);
                    console.error('Error fetching posts:', err);
                }
            }
        };

        if (communityDetails) {
            fetchPosts();
        }
    }, [id, communityDetails, isMember, API_URL, postCreated]);

    useEffect(() => {
        const fetchCommunityDetails = async () => {
            try {
                const response = await AxiosInstance.get(`/api/community/${id}`, {}, { withCredentials: true,});
                setCommunityDetails(response.data);
            } catch (error) {
                setError(`Error fetching community details: ${error.message}`);
                console.error('Error fetching memberships:', error);
            }
        };

        fetchCommunityDetails();
    }, [id]);


    if (!user) {
        return (
            <div>
                <div className="hero bg-base-200 min-h-screen">
                    <p className="text-center text-xl">Welcome to Synapse Space. Please login to continue.</p>
                </div>
            </div>
        );
    }
    if (!isMember) {
        return (
            <>
                {Error && <ErrorAlert text={Error} classExtensions="fixed z-50" />}
                {error && <ErrorAlert text={error} classExtensions="fixed z-50" />}
                <NavBar />
                <Sidebar />
                <MembersList id={id}/>
                <MainContentContainer>
                    <Banner communityName={communityDetails.name} commBanner={communityDetails.bannerURL} commAvatar={communityDetails.imgURL} />
                    <div className="flex flex-col items-start 00 mx-10">
                        <JoinCommuinityBtn communityId={communityDetails.id}/>
                        <article className="prose prose-gray">
                            <h2 className="heading-3">About {communityDetails.name}</h2>
                            <p>{communityDetails.description}</p>
                        </article>
                        <div className="divider"/>
                        <article className="prose prose-gray">
                            <h2 className="heading-3">Rules</h2>
                            <p>{communityDetails.rules}</p>
                        </article>

                    </div>
                </MainContentContainer>
            </>
        );
    }

    return (
        <>
            {Error && <ErrorAlert text={Error} classExtensions="fixed z-50"/>}
            <NavBar/>
            <Sidebar/>
            <MembersList id={id}/>
            <MainContentContainer>
                <Banner communityName={communityDetails.name} commBanner={communityDetails.bannerURL}
                        commAvatar={communityDetails.imgURL} communityID={communityDetails.id}/>
                <CreatePost userName={user.username} community={communityDetails.id} onPostCreated={() => setPostCreated(true)} />
                {posts.map((post) => (
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

            </MainContentContainer>
        </>
    );
}