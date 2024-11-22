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
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import JoinCommuinityBtn from "../../components/community/JoinCommuinityBtn";

export default function Community() {
    const { user, error: authError } = useContext(AuthContext);
    const { id } = useParams();
    const [isMember, setIsMember] = useState(false);
    const [communityDetails, setCommunityDetails] = useState([]);
    const [Error, setError] = useState(null);
    const [postCreated, setPostCreated] = useState(false);


    const fetchCommunityPosts = useCallback(async (page) => {
        try{
            const response= await AxiosInstance.get(`/api/community/${id}/posts/?page=${page}`,
                {},
                { withCredentials: true }
            );
            setIsMember(true);
            return response;
        } catch (error){
            setError(error?.status);
            console.error(error.message);
            setIsMember(false);
        }
    });


    useEffect(() => {
        const fetchCommunityDetails = async () => {
            try {
                console.log("fetching")
                const response = await AxiosInstance.get(`/api/community/${id}`, {}, { withCredentials: true,});
                setCommunityDetails(response.data);
            } catch (error) {
                setError(`Error fetching community details: ${error.message.split(':')[1]}}`);
                console.error('Error fetching memberships:', error);
            }
        };

        fetchCommunityDetails();
    }, [id]);


    const {
        loading,
        items: communityPosts,
        hasMore,
        loadMore,
        error: scrollError
    } = useInfiniteScroll(fetchCommunityPosts, [id]);


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
                {authError && <ErrorAlert text={authError} classExtensions="fixed z-50" />}
                <NavBar />
                <Sidebar />
                <MembersList id={id}/>
                <MainContentContainer>
                    <Banner communityName={communityDetails.name} commBanner={communityDetails.bannerURL} commAvatar={communityDetails.imgURL} communityID={communityDetails.id} />
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
            {(scrollError || Error) &&
                <ErrorAlert
                    text={ scrollError || Error}
                    classExtensions="fixed z-50"
                />
            }
            <NavBar />
            <Sidebar />
            <MembersList id={id}/>
            <MainContentContainer>
                <Banner communityName={communityDetails.name} commBanner={communityDetails.bannerURL}
                        commAvatar={communityDetails.imgURL} communityID={communityDetails.id}/>
                <CreatePost userName={user.username} community={communityDetails?.id} onPostCreated={() => setPostCreated(true)} rules={communityDetails?.rules} />
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
                        isPinned={post.isPinned}
                        createdAt={post.created_at}
                    />
                ))}
                {loading && <div className="loading loading-spinner loading-lg"></div>}
                {!hasMore && <div className="text-center mt-4">No more posts to load</div>}
            </MainContentContainer>
        </>
    );
}