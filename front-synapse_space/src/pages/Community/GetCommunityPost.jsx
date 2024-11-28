import React, { useState, useEffect, useContext } from "react";
import CommunityPost from "../../components/community/CommunityPost";
import AxiosInstance from "../../utils/AxiosInstance";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ErrorAlert from "../../components/ErrorAlert";
import NavBar from "../../components/NavBar";
import Sidebar from "../../components/Sidebar";
import MembersList from "../../components/community/MembersList";
import MainContentContainer from "../../components/MainContentContainer";
import { AuthContext } from "../../context/AuthContext";
import RichTextEditor from "../../components/RichTextEditor";
import DOMPurify from "dompurify";
import Footer from "../../components/Footer";
import { Helmet } from "react-helmet";
import SuccessAlert from "../../components/SuccessAlert";
import Loading from "../../components/Loading";

const GetCommunityPost = () => {
  const location = useLocation();
  const { state } = location || {}; // Safely handle if no state is passed
  const [isEditing, setIsEditing] = useState(state?.isEditing || false);

  const { community_id, post_id } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state added
  const { user } = useContext(AuthContext);
  const [editorContent, setEditorContent] = useState("");
  const [title, setTitle] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const getCommunityPost = async () => {
      setLoading(true); // Start loading
      try {
        const response = await AxiosInstance.get(
          `/api/community/${community_id}/post/${post_id}`,
          { withCredentials: true }
        );
        setPost(response.data);
        setTitle(response.data.title);
      } catch (error) {
        setError(`Error fetching post: ${error.message}`);
      } finally {
        setLoading(false); // End loading
      }
    };

    getCommunityPost();
  }, [community_id, post_id, isEditing]);

  const moveImagesToPermanentStorage = async (content, originalContent) => {
    const blocks = Array.isArray(content.blocks) ? content.blocks : [];
    const originalBlocks = Array.isArray(originalContent.blocks)
      ? originalContent.blocks
      : [];

    const updatedBlocks = await Promise.all(
      blocks.map(async (block, index) => {
        const originalBlock = originalBlocks[index]; // Safe access

        if (!originalBlock || block.type !== "image") {
          return block;
        }

        const originalUrl = originalBlock?.data?.file?.url;
        const currentUrl = block.data.file.url;

        if (currentUrl === originalUrl) {
          return block;
        }

        try {
          const tempUrl = currentUrl;
          const response = await AxiosInstance.post(
            `/api/move-image/`,
            { tempUrl },
            {
              withCredentials: true,
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          if (response.status === 200) {
            block.data.file.url = response.data.newUrl;
          }
        } catch (error) {
          console.error("Error moving image:", error);
        }

<<<<<<< Updated upstream



    return (
        <>
            <Helmet>
                <title>{post?.title ? post.title: `Community`} - Synapse Space</title>
            </Helmet>
        <div className="flex flex-col min-h-screen">
            {error && <ErrorAlert text={error} classExtensions="fixed z-50" />}
            {success && <SuccessAlert text={success} classExtensions="fixed z-50" />}
            <NavBar />
            <Sidebar />
            <MembersList id={community_id} />
            <MainContentContainer>

                {post ? (
                    isEditing ? (
                        <div className="flex flex-col m-6">
                            <form onSubmit={handleSubmit} className="form form-control">
                                <label className="text-sm font-bold">Title</label>
                                <input type="text" name="title" defaultValue={post.title}
                                       className="m-3 input input-primary"
                                       onChange={(e) => setTitle(e.target.value)}
                                       required />
                                <span className="text-sm font-bold">Content</span>
                                <RichTextEditor
                                    setEditorContent={setEditorContent}
                                    isEditing={isEditing}
                                    initialContent={post.content}
                                />
                                <button type="submit" className="m-6 btn btn-primary">Save Changes</button>
                            </form>
                        </div>
                    ) : (
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
                            userAvatar={post.userAvatar}
                            isPinned={post.isPinned}
                            createdAt={post.created_at}
                        />
                    )
                ) : (
                    <h2>Post does not exist</h2>
                )}
            </MainContentContainer>
            <Footer/> 
        </div>
    </>
=======
        return block;
      })
>>>>>>> Stashed changes
    );

    return { ...content, blocks: updatedBlocks };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!editorContent.blocks || editorContent.blocks.length === 0) {
      setError("Content is required");
      return;
    }

    try {
      const updatedContent = await moveImagesToPermanentStorage(
        editorContent,
        post.content
      );

      const formData = new FormData();
      formData.append("title", DOMPurify.sanitize(title));
      formData.append("content", JSON.stringify(updatedContent));
      formData.append("posted_in", community_id);

      const response = await AxiosInstance.put(
        `/api/community/${community_id}/post/update/${post_id}/`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setEditorContent("");
      setSuccess("Post Edited successfully");
      setIsEditing(false);
      navigate(`/community/${community_id}`);
    } catch (error) {
      setError("Error submitting post: " + error);
    }
  };

  return (
    <>
      <Helmet>
        <title>{post?.title ? post.title : `Community`} - Synapse Space</title>
      </Helmet>
      <div className="flex flex-col min-h-screen">
        {error && <ErrorAlert text={error} classExtensions="fixed z-50" />}
        {success && <SuccessAlert text={success} classExtensions="fixed z-50" />}
        <NavBar />
        <Sidebar />
        <MembersList id={community_id} />
        <MainContentContainer>
          {loading ? (
            <Loading /> // Show loading state
          ) : post ? (
            isEditing ? (
              <div className="flex flex-col m-6">
                <form onSubmit={handleSubmit} className="form form-control">
                  <label className="text-sm font-bold">Title</label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={post.title}
                    className="m-3 input input-primary"
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                  <span className="text-sm font-bold">Content</span>
                  <RichTextEditor
                    setEditorContent={setEditorContent}
                    isEditing={isEditing}
                    initialContent={post.content}
                  />
                  <button type="submit" className="m-6 btn btn-primary">
                    Save Changes
                  </button>
                </form>
              </div>
            ) : (
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
                userAvatar={post.userAvatar}
                isPinned={post.isPinned}
                createdAt={post.created_at}
              />
            )
          ) : (
            <h2>Post does not exist</h2>
          )}
        </MainContentContainer>
        <Footer />
      </div>
    </>
  );
};

export default GetCommunityPost;
