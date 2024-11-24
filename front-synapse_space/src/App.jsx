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
import RegistrationDenied from "./pages/RegistrationDenied";
import ProfilePage from './pages/Profile/ProfilePage';
import FeedbackForm from './pages/FeedbackForm';
import UserProfilePage from './components/profile/UserProfilePage';
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

import Dashboard from "./pages/admin/Dashboard"
import Users from "./pages/admin/Users"
import Programs from "./pages/admin/Programs"
import Verifications from "./pages/admin/Verifications"
import HelpCenter from "./pages/HelpCenter";
import { ToastContainer } from 'react-toastify';
import Login from "./pages/admin/Login";


import Chat from "./pages/Chat";
import { initCometChat } from "./lib/cometchat";
import ChatWindow from "./components/CometChat/ChatWindow";
import { Activities } from "./pages/admin/Activities";
import ResetPasswordConfirm from './pages/ResetPasswordConfirm';
import Footer from './components/Footer';
import Account from "./pages/admin/Account";
import Settings from "./pages/admin/Settings";
function App() {
  const [isMobileView, setIsMobileView] = useState(false);
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


  return (
    <>
      <ToastContainer />
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
                  <Route path="/profile" element={<PrivateRoute />}>
                    <Route path="user/:userId" element={<UserProfilePage />} />
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
                    <Route path="/management/login" element={<Login />} />
                  </Route>
                  <Route path="/" element={<PublicRoute />}>
                    <Route path="/reset-password" element={<ResetPassword />} />
                  </Route>
                  <Route path="/" element={<PublicRoute />}>
                    <Route path="/reset-password/:uid/:token" element={<ResetPasswordConfirm />} />
                  </Route>
                  <Route path="/" element={<PublicRoute />}>
                    <Route path="/register" element={<UserRegister />} />
                  </Route>
                  <Route path="/terms-of-use" element={<TermsOfUse />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/" element={<PrivateRoute />}>
                    <Route path="/feedback" element={<FeedbackForm />} />
                  </Route>
                  <Route path="/help-center" element={<HelpCenter />} />
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

                  <Route path="/chat" element={<PrivateRoute />}>
                    <Route path="/chat" element={<Chat />}>
                      <Route index element={
                        <div className="flex items-center justify-center flex-1 text-gray-500">
                          Select a conversation to start messaging
                        </div>
                      } />
                      <Route path=":uid" element={<ChatWindow />} />
                    </Route>
                  </Route>

                  {/*admin routes*/}

                  <Route path="/management" element={<AdminRoute />}>
                    <Route path="/management" element={<Dashboard />} />
                  </Route>

                  <Route path="/management/users" element={<AdminRoute />}>
                    <Route path="/management/users" element={<Users />} />
                  </Route>

                  <Route path="/management/programs" element={<AdminRoute />}>
                    <Route path="/management/programs" element={<Programs />} />
                  </Route>

                  <Route path="/management/activities" element={<AdminRoute />}>
                    <Route path="/management/activities" element={<Activities />} />
                  </Route>

                  <Route path="/management/verifications" element={<AdminRoute />}>
                    <Route path="/management/verifications" element={<Verifications />} />
                  </Route>

                  <Route path="/management/account" element={<AdminRoute />}>
                    <Route path="/management/account" element={<Account/>} />
                  </Route>

                  <Route path="/management/settings" element={<AdminRoute />}>
                    <Route path="/management/settings" element={<Settings/>} />
                  </Route>


              </Routes>
              </NotificationProvider>
            </FriendProvider>
          </MembershipsProvider>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;
