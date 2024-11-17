import React, { useEffect, useState } from "react";
import { CometChat } from "@cometchat/chat-sdk-javascript";
import { useNavigate } from "react-router-dom";
import { Search, MessageSquare, Settings, LogOut } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { logoutUser } from "../../lib/cometchat";

export default function ChatSidebar() {
    const [conversations, setConversations] = useState<CometChat.Conversation[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<CometChat.User[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const navigate = useNavigate();
    const { setCometUser } = useAuthStore();

    // Load conversations when component mounts
    useEffect(() => {
        loadConversations();
    }, []);

    // Search users with a delay to prevent rapid requests
    useEffect(() => {
        const searchTimer = setTimeout(() => {
            if (searchQuery) {
                searchUsers();
            } else {
                setSearchResults([]);
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(searchTimer);
    }, [searchQuery]);

    // Function to search for users based on the search query
    const searchUsers = async () => {
        setIsSearching(true);
        try {
            const limit = 30;
            const usersRequest = new CometChat.UsersRequestBuilder()
                .setLimit(limit)
                .setSearchKeyword(searchQuery)
                .build();

            const users = await usersRequest.fetchNext();
            setSearchResults(users);
        } catch (error) {
            console.error('Error searching users:', error);
        } finally {
            setIsSearching(false);
        }
    };

    // Load conversations
    const loadConversations = async () => {
        const conversationsRequest = new CometChat.ConversationsRequestBuilder()
            .setLimit(30)
            .build();

        try {
            const conversationsList = await conversationsRequest.fetchNext();
            console.log("Conversations loaded:", conversationsList); // Debugging log
            if (conversationsList.length > 0) {
                setConversations(conversationsList);
            } else {
                console.log("No conversations found."); // Debugging log
                setConversations([]); // Ensure state is cleared if no conversations
            }
        } catch (error) {
            console.error("Error loading conversations:", error);
        }
    };

    // Handle conversation click
    const handleConversationClick = (conversation: CometChat.Conversation) => {
        const uid = conversation.getConversationType() === 'user'
            ? conversation.getConversationWith().getUid()
            : conversation.getConversationId();
        navigate(`/chat/${uid}`);
        setSearchQuery('');
        setSearchResults([]);
    };

    // Handle user click (search result click)
    const handleUserClick = (user: CometChat.User) => {
        navigate(`/chat/${user.getUid()}`);
        setSearchQuery('');
        setSearchResults([]);
    };

    return (
        <div className="w-80 h-screen border-r border-gray-200 flex flex-col">
            <div className="p-3.5 border-b border-gray-200">
                <div className="flex items-center space-x-2 rounded-full px-4">
                    <label className="input input-bordered flex items-center gap-2 w-full">
                        <Search className="w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search messages"
                            className="w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </label>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {searchQuery ? (
                    <div>
                        {isSearching ? (
                            <div className="p-4 text-center">Searching...</div>
                        ) : searchResults.length > 0 ? (
                            searchResults.map((user) => (
                                <div
                                    key={user.getUid()}
                                    className="p-4 bg-base-100 my-2 rounded shadow hover:bg-accent hover:text-accent-content cursor-pointer"
                                    onClick={() => handleUserClick(user)}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 rounded-full flex items-center justify-center">
                                            {user.getAvatar() ? (
                                                <img
                                                    src={user.getAvatar()}
                                                    alt={user.getName()}
                                                    className="w-12 h-12 rounded-full"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                                                    {user.getName().charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{user.getName()}</h3>
                                            <p className="text-sm text-gray-500">{user.getStatus()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-gray-500">No users found</div>
                        )}
                    </div>
                ) : (
                    // Display conversations when not searching
                    <div>
                        {conversations.length > 0 ? (
                            conversations.map((conversation) => {
                                const user =
                                    conversation.getConversationType() === "user"
                                        ? (conversation.getConversationWith() as CometChat.User)
                                        : null;

                                return (
                                    <div
                                        key={conversation.getConversationId()}
                                        className="p-4 bg-base-100 my-2 rounded shadow hover:bg-accent cursor-pointer"
                                        onClick={() => handleConversationClick(conversation)}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 rounded-full flex items-center justify-center">
                                                {user?.getAvatar() ? (
                                                    <img
                                                        src={user.getAvatar()}
                                                        alt={user.getName()}
                                                        className="w-12 h-12 rounded-full"
                                                    />
                                                ) : (
                                                    <MessageSquare className="w-6 h-6 " />
                                                )}
                                            </div>
                                            <div className="flex-1 w-full h-full hover:text-accent-content">
                                                <h3 className="font-semibold">
                                                    {user?.getName() || conversation.getConversationId()}
                                                </h3>
                                                <p className="text-sm text-secondary truncate">
                                                    {conversation.getLastMessage()?.getText() ||
                                                        "No messages yet"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-4 text-center text-gray-500">No conversations found</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
