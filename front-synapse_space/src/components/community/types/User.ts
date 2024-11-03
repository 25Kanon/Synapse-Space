export interface User {
    user_id: string;
    username: string;
    status: 'active' | 'pending' | 'banned';
    userAvatar: string;
}