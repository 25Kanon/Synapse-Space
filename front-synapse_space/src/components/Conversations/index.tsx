import React, { useContext, useEffect, useState } from "react";
import {
    CometChatCallButtons,
    CometChatConversationsWithMessages,
    CometChatIncomingCall,
    CometChatOutgoingCall,
    CometChatThemeContext,
    CometChatUIKit,
    UIKitSettingsBuilder
} from "@cometchat/chat-uikit-react";
import { useLocation } from "react-router-dom";
import { CometChat } from "@cometchat/chat-sdk-javascript";
import { AuthContext } from "../../context/AuthContext";
import MainContentContainer from "../MainContentContainer";

export function ConversationsWithMessagesWrapper() {
    const { state } = useLocation();
    const changeThemeToCustom = state?.changeThemeToCustom;
    const { theme } = useContext(CometChatThemeContext); // Get theme from context
    const { user } = useContext(AuthContext);  // Access logged-in user from AuthContext
    const [loading, setLoading] = useState(true);
    const [uid, setUid] = useState<string | null>(null);
    const [loginError, setLoginError] = useState<string | null>(null);
    const [isCometChatInitialized, setIsCometChatInitialized] = useState(false); // Track initialization state
    const [isMobileView, setIsMobileView] = useState(false); // Track mobile view state

    const appID = import.meta.env.VITE_COMET_CHAT_APP_ID as string;
    const region = import.meta.env.VITE_COMET_CHAT_REGION as string;
    const authKey = import.meta.env.VITE_COMET_CHAT_AUTH_KEY as string;

    let themeMode =document.documentElement.getAttribute('data-theme');
    theme.palette.setMode(themeMode);

    const checkMobileView = () => {
        if (window.innerWidth <= 768) {
            setIsMobileView(true);  // Set to true if screen is smaller than or equal to 768px
        } else {
            setIsMobileView(false);
        }
    };

    // Set up event listener on mount and clean up on unmount
    useEffect(() => {
        checkMobileView(); // Check initial screen size
        window.addEventListener("resize", checkMobileView); // Add resize event listener

        return () => {
            window.removeEventListener("resize", checkMobileView); // Clean up the event listener on unmount
        };
    }, []);

    // Initialize CometChat UI Kit
    useEffect(() => {
        const initCometChat = async () => {
            if (!appID || !region || !authKey) {
                console.error("CometChat environment variables are not set properly");
                return;
            }

            const uiKitSettings = new UIKitSettingsBuilder()
                .setAppId(appID)
                .setRegion(region)
                .setAuthKey(authKey)
                .subscribePresenceForAllUsers()
                .build();

            try {
                await CometChatUIKit.init(uiKitSettings);
                console.log("CometChat initialized");
                setIsCometChatInitialized(true);
                setLoading(false);
            } catch (error) {
                console.error("CometChat initialization failed:", error);
            }
        };

        initCometChat();
    }, []); // Run only once when the component mounts

    // Set the uid once the user object is available
    useEffect(() => {
        if (user?.username) {
            setUid(user.username);  // Set the user username or user.id depending on your UID strategy
        }
    }, [user]);

    // Log in to CometChat once uid and initialization are confirmed
    useEffect(() => {
        if (isCometChatInitialized && uid) {
            const loginToCometChat = async () => {
                try {
                    const loggedInUser = await CometChatUIKit.login(uid);
                    console.log("Login successful:", loggedInUser);
                } catch (error) {
                    console.error("Login failed:", error);
                    if (error instanceof CometChat.CometChatException && error.message) {
                        setLoginError(error.message);
                    }
                }
            };
            loginToCometChat();
        }
    }, [isCometChatInitialized, uid]); // Run login only when CometChat is initialized and uid is set

    if (loading) {
        return <div>Loading...</div>;
    }

    if (loginError) {
        return <div>Error: {loginError}</div>;
    }

    return (
        <div className="flex h-screen">
            <CometChatThemeContext.Provider value={{ theme } }>
                <CometChatConversationsWithMessages isMobileView={isMobileView}/>
                <CometChatIncomingCall />
            </CometChatThemeContext.Provider>
        </div>
    );
}