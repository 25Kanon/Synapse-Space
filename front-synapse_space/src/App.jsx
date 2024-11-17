import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import './App.css';
import PrivateRoute from './utils/PrivateRoute';
import PublicRoute from './utils/PublicRoute';
import AdminRoute from './utils/AdminRoute';
import Home from './pages/Home';
import UserLogin from './pages/UserLogin';
import TermsOfUse from "./pages/TermsOfUse";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ResetPassword from './pages/ResetPasswordForm';
import UserRegister from './pages/UserRegister';
import ProfilePage from './pages/Profile/ProfilePage';
import EditProfile from './pages/Profile/EditProfile';
import Create from './pages/Community/Create';
import SearchCommunity from './pages/Community/SearchCommunity';
import Community from './pages/Community/Community';
import GetCommunityPost from "./pages/Community/GetCommunityPost";
import { MembershipsProvider } from './context/MembershipContext';
import ModDashboard from './pages/Community/ModDashboard';
import CommunitySettings from './pages/Community/CommunitySettings';
import { FriendProvider } from './context/FriendContext';
import Discovery from "./pages/Discovery";
import { ConversationsWithMessagesWrapper } from "./components/Conversations";
import { NotificationProvider } from "./context/NotificationContext";

import Dashboard from "./pages/Admin/Dashboard"
import Users from "./pages/Admin/Users"
import Programs from "./pages/Admin/Programs"
import Verifications from "./pages/Admin/Verifications"



import { CometChatTheme, CometChatUsersWithMessages } from "@cometchat/chat-uikit-react";
import Chat from "./pages/Chat";
import {initCometChat} from "./lib/cometchat";
import ChatWindow from "./components/CometChat/ChatWindow";

function App() {
  const [isMobileView, setIsMobileView] = useState(false);
  const [CometTheme, setCometTheme] = useState(new CometChatTheme({}));
  const [theme, setTheme] = useState(() => {
    const systemPreference = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    return localStorage.getItem('theme') || systemPreference;
  });
  useEffect(() => {
    const initializeCometChatAsync = async () => {
      try {
        await initCometChat();
        console.log('CometChat initialized successfully');
      } catch (error) {
        console.error('Error initializing CometChat:', error);
      }
    };

    initializeCometChatAsync();
  }, []);

  useEffect(() => {
    // Set the initial theme based on user preference or system preference
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Effect to listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e) => {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  useEffect(() => {
    // Handle initial theme change based on local storage or system preference
    const savedTheme = localStorage.getItem('theme');
    localStorage.removeItem('theme')
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setTheme(systemTheme);
    }
  }, []);

  const getConversationsWithMessages = () => {
    return <ConversationsWithMessagesWrapper isMobileView={isMobileView} />;
  }

  function getUsersWithMessages() {
    return <CometChatUsersWithMessages isMobileView={isMobileView} />;
  }

  return (
    <Router>
      <AuthProvider>
        <MembershipsProvider>
          <FriendProvider>
            <NotificationProvider>
              <Routes>
                <Route path="/" element={<PrivateRoute />}>
                  <Route path="/" element={<Home />} />
                </Route>
                <Route path="/profile" element={<PrivateRoute />}>
                  <Route path="/profile" element={<ProfilePage />} />
                </Route>
                <Route path="/edit-profile" element={<PrivateRoute />}>
                  <Route path="/edit-profile" element={<EditProfile />} />
                </Route>
                <Route path="/activities" element={<PrivateRoute />}>
                  <Route path="/activities" element={<ProfilePage />} />
                </Route>
                <Route path="/" element={<PublicRoute />}>
                  <Route path="/login" element={<UserLogin />} />
                </Route>
                <Route path="/" element={<PublicRoute />}>
                  <Route path="/reset-password" element={<ResetPassword />} />
                </Route>
                <Route path="/" element={<PublicRoute />}>
                  <Route path="/register" element={<UserRegister />} />
                </Route>
                <Route path="/" element={<PublicRoute />}>
                  <Route path="/terms-of-use" element={<TermsOfUse />} />
                </Route>
                <Route path="/" element={<PublicRoute />}>
                  <Route path="privacy-policy" element={<PrivacyPolicy />} />
                </Route>
                <Route path="/community" element={<PrivateRoute />}>
                  <Route path="/community/:id" element={<Community />} />
                </Route>
                <Route path="/community" element={<PrivateRoute />}>
                  <Route path="/community/:community_id/post/:post_id" element={<GetCommunityPost />} />
                </Route>
                <Route path="/community/" element={<PrivateRoute />}>
                  <Route path="/community/:community_id/mod" element={<ModDashboard />} />
                </Route>
                <Route path="/community/:community_id/settings" element={<PrivateRoute />}>
                  <Route path="/community/:community_id/settings" element={<CommunitySettings />} />
                </Route>
                <Route path="/community" element={<PrivateRoute />}>
                  <Route path="/community/create" element={<Create />} />
                </Route>
                <Route path="/search" element={<PrivateRoute />}>
                  <Route path="/search" element={<SearchCommunity />} />
                </Route>
                <Route path="/discover" element={<PrivateRoute />}>
                  <Route path="/discover" element={<Discovery />} />
                </Route>
                <Route path="/messages" element={<PrivateRoute />}>
                  <Route path="/messages" element={getConversationsWithMessages()} />
                </Route>

                <Route path="/chat" element={<PrivateRoute />}>
                  <Route path="/chat" element={<Chat />}>
                    <Route index element={
                      <div className="flex-1 flex items-center justify-center text-gray-500">
                        Select a conversation to start messaging
                      </div>
                    } />
                    <Route path=":uid" element={<ChatWindow />} />
                  </Route>
                </Route>

                {/*admin routes*/}

                <Route path="/admin" element={<AdminRoute />}>
                  <Route path="/admin" element={<Dashboard />} />
                </Route>

                <Route path="/admin/users" element={<AdminRoute />}>
                  <Route path="/admin/users" element={<Users />} />
                </Route>

                <Route path="/admin/programs" element={<AdminRoute />}>
                  <Route path="/admin/programs" element={<Programs />} />
                </Route>

                <Route path="/admin/verifications" element={<AdminRoute />}>
                  <Route path="/admin/verifications" element={<Verifications />} />
                </Route>


              </Routes>

            </NotificationProvider>
          </FriendProvider>
        </MembershipsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
