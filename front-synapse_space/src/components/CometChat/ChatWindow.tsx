import React, { useEffect, useState, useRef } from 'react';
import { CometChat } from '@cometchat/chat-sdk-javascript';
import { useParams } from 'react-router-dom';
import { Send, Phone, Video } from 'lucide-react';
import { useAuthStore } from "../../store/useAuthStore";

export default function ChatWindow() {
    const { uid } = useParams();
    const [messages, setMessages] = useState<CometChat.BaseMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [recipient, setRecipient] = useState<CometChat.User | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isCallInProgress, setIsCallInProgress] = useState(false);
    const { user: currentUser } = useAuthStore();

    useEffect(() => {
        if (uid) {
            loadMessages();
            loadUserDetails();
            listenForMessages();
            listenForCalls();
        }

        return () => {
            CometChat.removeMessageListener('UNIQUE_LISTENER_ID');
            CometChat.removeCallListener('CALL_LISTENER_ID');
        };
    }, [uid]);

    const loadUserDetails = async () => {
        if (uid) {
            try {
                const user = await CometChat.getUser(uid);
                setRecipient(user);
            } catch (error) {
                console.error('Error loading user details:', error);
            }
        }
    };

    const loadMessages = async () => {
        if (!uid) return;

        try {
            const limit = 50;
            const messagesRequest = new CometChat.MessagesRequestBuilder()
                .setUID(uid)
                .setLimit(limit)
                .hideReplies(true)
                .setTypes([CometChat.MESSAGE_TYPE.TEXT])
                .build();

            const messageList = await messagesRequest.fetchPrevious();
            if (messageList) {
                setMessages(messageList);
                scrollToBottom();
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    const listenForMessages = () => {
        CometChat.addMessageListener(
            'UNIQUE_LISTENER_ID',
            new CometChat.MessageListener({
                onTextMessageReceived: (message: CometChat.BaseMessage) => {
                    if (message.getSender().getUid() === uid || message.getReceiverId() === uid) {
                        setMessages((prevMessages) => [...prevMessages, message]);
                        scrollToBottom();
                    }
                },
            })
        );
    };

    const listenForCalls = () => {
        CometChat.addCallListener(
            'CALL_LISTENER_ID', // Ensure this ID is unique across the app
            new CometChat.CallListener({
                onIncomingCallReceived: (call: CometChat.Call) => {
                    console.log('Incoming call:', call);
                    setIsCallInProgress(true);
                    // Auto accept the call for demo purposes
                    CometChat.acceptCall(call.getSessionId()).then(
                        (acceptedCall) => {
                            console.log('Call accepted:', acceptedCall);
                            window.open(acceptedCall.getSessionId(), '_blank');
                        },
                        (error) => {
                            console.log('Error accepting call:', error);
                            setIsCallInProgress(false);
                        }
                    );
                },
                onOutgoingCallAccepted: (call: CometChat.Call) => {
                    console.log('Outgoing call accepted:', call);
                    window.open(call.getSessionId(), '_blank');
                },
                onOutgoingCallRejected: () => {
                    console.log('Outgoing call rejected');
                    setIsCallInProgress(false);
                },
                onIncomingCallCancelled: () => {
                    console.log('Incoming call cancelled');
                    setIsCallInProgress(false);
                },
            })
        );
    };


    const initiateCall = async (type: 'audio' | 'video') => {
        if (!uid || isCallInProgress) return;
        console.log("Call initiated");

        const callType = type === 'video' ? CometChat.CALL_TYPE.VIDEO : CometChat.CALL_TYPE.AUDIO;
        const call = new CometChat.Call(uid, callType, CometChat.RECEIVER_TYPE.USER);

        try {
            const outgoingCall = await CometChat.initiateCall(call);
            setIsCallInProgress(true);
            console.log('Call initiated:', outgoingCall);
            window.open(outgoingCall.getSessionId(), '_blank');  // Open the call in a new tab
        } catch (error) {
            console.error('Error initiating call:', error);
            setIsCallInProgress(false);
        }
    };


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const sendMessage = async () => {
        if (!inputMessage.trim() || !uid || !currentUser) return;

        const textMessage = new CometChat.TextMessage(
            uid,
            inputMessage,
            CometChat.RECEIVER_TYPE.USER
        );

        try {
            const sentMessage = await CometChat.sendMessage(textMessage);
            setMessages((prevMessages) => [...prevMessages, sentMessage]);
            setInputMessage('');
            scrollToBottom();
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const formatTime = (timestamp: number) => {
        try {
            return new Date(timestamp * 1000).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch (error) {
            return '';
        }
    };

    const isOutgoing = (message: CometChat.BaseMessage) => {
        // Ensure currentUser is an instance of CometChat.User
        if (currentUser instanceof CometChat.User) {
            return message.getSender().getUid() === currentUser.getUid();
        }
        console.error('currentUser is not an instance of CometChat.User');
        return false;
    };

    return (
        <div className="flex-1 flex flex-col h-screen">
            <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                        {recipient?.getAvatar() ? (
                            <img
                                src={recipient.getAvatar()}
                                alt={recipient.getName()}
                                className="w-10 h-10 rounded-full"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                                {recipient?.getName()?.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div>
                        <h2 className="font-semibold">{recipient?.getName()}</h2>
                        <p className="text-sm text-gray-500">
                            {recipient?.getStatus() === 'online' ? 'Active Now' : 'Offline'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <button className="p-2 hover:bg-neutral rounded-full" onClick={() => initiateCall('audio')}>
                        <Phone className="w-5 h-5" />
                    </button>
                    <button className="p-2 hover:bg-neutral rounded-full" onClick={() => initiateCall('video')}>
                        <Video className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">

                {messages.map((message) => {
                    const outgoing = isOutgoing(message);

                    return (

                        <div
                            key={message.getId()}
                            className={`chat ${outgoing ? 'chat-end' : 'chat-start'}`}
                        >
                            <div
                                className={` chat-bubble max-w-[70%] ${
                                    outgoing ? 'chat-bubble-primary' : 'chat-bubble-accent'
                                }`}
                            >
                                <p>{message.getText()}</p>
                                <p className="text-xs mt-1 opacity-70">
                                    {formatTime(message.getSentAt())}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef}/>
            </div>

            <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        placeholder="Type a message..."
                        className="flex-1 rounded-full border border-gray-300 px-4 py-2 focus:outline-none focus:border-blue-500"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <button
                        onClick={sendMessage}
                        className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
