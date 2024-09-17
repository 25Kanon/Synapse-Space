import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './utils/PrivateRoute';
import PublicRoute from './utils/PublicRoute';
import Home from './pages/Home';
import UserLogin from './pages/UserLogin';
import UserRegister from './pages/UserRegister';

import './App.css';
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
          <Route path="/login" element={<PublicRoute />}>
            <Route path="/login" element={<UserLogin />} />
          </Route>
          <Route path="/register" element={<PublicRoute />}>
            <Route path="/register" element={<UserRegister />} />
          </Route>
          <Route path="/community" element={<PrivateRoute />}>
            <Route path="/community" element={<Community />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
