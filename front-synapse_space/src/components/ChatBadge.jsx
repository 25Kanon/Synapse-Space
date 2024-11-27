import React, { useState, useEffect } from 'react';
import { CometChat } from '@cometchat/chat-sdk-javascript';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMessage
} from "@fortawesome/free-solid-svg-icons";

const ChatBadge = () => {
    const [unreadMessages, setUnreadMessages] = useState(0);

    // Function to handle new message arrival
    const messageListener = (message) => {
        // Increment unread message count
        setUnreadMessages((prev) => prev + 1);
    };

    useEffect(() => {
        // Add message listener when component mounts
        const listenerID = 'message_listener';
        CometChat.addMessageListener(listenerID, {
            onTextMessageReceived: messageListener,
        });

        // Cleanup listener on component unmount
        return () => {
            CometChat.removeMessageListener(listenerID);
        };
    }, [messageListener]);

    return (
        <div className="relative">
            <FontAwesomeIcon icon={faMessage} className="z-40 h-5 mr-5"/>
            {unreadMessages > 0 && (
                <span
                    className="absolute -top-3 right-0 flex items-center justify-center w-5 h-5 text-xs text-white bg-red-600 rounded-full">
          {unreadMessages}
        </span>
            )}
        </div>
    );
};

export default ChatBadge;
