import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import './App.css';
import PrivateRoute from './utils/PrivateRoute';
import PublicRoute from './utils/PublicRoute';
import Home from './pages/Home';
import UserSetup from "./pages/UserSetup";
import UserLogin from './pages/UserLogin';
import UserRegister from './pages/UserRegister';
import ProfilePage from './pages/Profile/ProfilePage';
import EditProfile from './pages/Profile/EditProfile';
import Create from './pages/Community/Create';
import SearchCommunity from './pages/Community/SearchCommunity';
import Community from './pages/Community/Community';
import GetCommunityPost from "./pages/Community/GetCommunityPost";
import { MembershipsProvider } from './context/MembershipContext';
import ModDashboard from './pages/Community/ModDashboard';
import { FriendProvider } from './context/FriendContext';
import Discovery from "./pages/Discovery";

function App() {
  const [theme, setTheme] = useState(() => {
    const systemPreference = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    return localStorage.getItem('theme') || systemPreference;
  });

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
    <Router>
      <AuthProvider>
        <MembershipsProvider>
          <FriendProvider>
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
                <Route path="/register" element={<UserRegister />} />
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
              <Route path="/community" element={<PrivateRoute />}>
                <Route path="/community/create" element={<Create />} />
              </Route>
              <Route path="/search" element={<PrivateRoute />}>
                <Route path="/search" element={<SearchCommunity />} />
              </Route>
              <Route path="/discover" element={<PrivateRoute />}>
                <Route path="/discover" element={<Discovery />} />
              </Route>
            </Routes>
          </FriendProvider>
        </MembershipsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
