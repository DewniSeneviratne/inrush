import React, { useEffect, useState } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import LoginForm from './components/auth/LoginForm';
import RegisterPage from './components/auth/RegisterForm';
import PostList from './components/posts/PostList';


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login state

  // Check login state from localStorage when the app loads
  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true'); // Save login state to localStorage
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn'); // Remove login state from localStorage
  };

  return (
    <Router>
      <Routes>
        {/* Login Route */}
        <Route
          path="/login"
          element={<LoginForm onLoginSuccess={handleLoginSuccess} />}
        />
        
        {/* Register Route */}
        <Route
          path="/register"
          element={<RegisterPage />}
        />
        
        {/* Redirect to posts list if logged in */}
        <Route
          path="/posts/list"
          element={isLoggedIn ? <PostList /> : <Navigate to="/login" />}
        />

        {/* Default Route - Redirect to login if not logged in */}
        <Route
          path="/"
          element={isLoggedIn ? <Navigate to="/posts/list" /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
