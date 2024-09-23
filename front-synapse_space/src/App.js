import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import './App.css';
import PrivateRoute from './utils/PrivateRoute';
import PublicRoute from './utils/PublicRoute';
import Home from './pages/Home';
import UserLogin from './pages/UserLogin';
import UserRegister from './pages/UserRegister';
import Create from './pages/Community/Create';
import SearchCommunity from './pages/Community/SearchCommunity';
import Community from './pages/Community/Community';

function App() {
  const [theme, setTheme] = useState(() => {
    const systemPreference = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    return localStorage.getItem('theme') || systemPreference;
  });

  useEffect(() => {
    document.title = "Synapse Space";
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleThemeChange = (event) => {
    const newTheme = event.target.checked ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<PrivateRoute />}>
            <Route path="/" element={<Home />} />
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
            <Route path="/community/create" element={<Create />} />
          </Route>
          <Route path="/search" element={<PrivateRoute />}>
            <Route path="/search" element={<SearchCommunity />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
