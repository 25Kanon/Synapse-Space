import { CometChat } from '@cometchat/chat-sdk-javascript';

const COMET_CHAT_APP_ID = import.meta.env.VITE_COMET_CHAT_APP_ID as string;
const COMET_CHAT_REGION = import.meta.env.VITE_COMET_CHAT_REGION as string;
const COMET_CHAT_AUTH_KEY = import.meta.env.VITE_COMET_CHAT_AUTH_KEY as string;


export const initCometChat = async () => {
    try {
        const appSetting = new CometChat.AppSettingsBuilder()
            .subscribePresenceForAllUsers()
            .setRegion(COMET_CHAT_REGION)
            .build();

        await CometChat.init(COMET_CHAT_APP_ID, appSetting);
        console.log('CometChat initialization completed successfully');
    } catch (error) {
        console.error('CometChat initialization failed:', error);
    }
};

export const loginUser = async (uid: string) => {
    try {
        const user = await CometChat.login(uid, COMET_CHAT_AUTH_KEY);
        console.log('Login successful:', user);
        return user;
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
};

export const logoutUser = async () => {
    try {
        await CometChat.logout();
        console.log('Logout successful');
    } catch (error) {
        console.error('Logout failed:', error);
        throw error;
    }
};