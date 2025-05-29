import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import LandingPage from './LandingPage';
import Login from './Login';
import Signup from './Signup';
import Dashboard from './Dashboard';
import ResetPassword from './ResetPassword';
import ForgotPassword from './ForgotPassword';
import UserDetail from './UserDetail';

function App() {
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', phone: '' });
  const [darkMode, setDarkMode] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (query.trim()) searchUsers(query);
    }, 500);
    return () => clearTimeout(delaySearch);
  }, [query]);

  const searchUsers = async (searchTerm) => {
    setError(null);
    setLoading(true);
    try {
      const response = await axios.get(`https://user-lookup-app.onrender.com/search?query=${searchTerm}`);
      setResults(response.data);
    } catch (err) {
      console.error('Search error:', err);
      setError('Error loading users');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    navigate('/login');
  };

  return (
    <div className={darkMode ? 'app dark-mode' : 'app'}>
      <header className="banner">
        <div className="banner-top">
          <span className="banner-title">User Lookup Tool</span>
          <button className="dark-toggle" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); searchUsers(query); }} className="search-form">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users..."
          />
          <button type="submit">🔍</button>
        </form>

        <div className="banner-buttons">
          <button className="btn-secondary" onClick={() => navigate('/login')}>🔐 Login</button>
          <button className="btn-secondary" onClick={() => navigate('/signup')}>📝 Sign Up</button>
          <button className="btn-secondary" onClick={() => navigate('/dashboard')}>📊 Dashboard</button>
          <button className="btn-secondary" onClick={handleLogout}>🚪 Logout</button>
        </div>
      </header>

      {loading && <div className="overlay"><div className="spinner" /></div>}

      <Routes>
        <Route
          path="/"
          element={
            <LandingPage
              setError={setError}
              setLoading={setLoading}
              navigate={navigate}
              setQuery={setQuery}
              setResults={setResults}
              setNewUser={setNewUser}
            />
          }
        />
        <Route
          path="/login"
          element={
            <Login
              setError={setError}
              setLoading={setLoading}
              navigate={navigate}
              setQuery={setQuery}
              setResults={setResults}
              setNewUser={setNewUser}
            />
          }
        />
        <Route
          path="/signup"
          element={<Signup setError={setError} setLoading={setLoading} navigate={navigate} />}
        />
        <Route
          path="/dashboard"
          element={<Dashboard setError={setError} setLoading={setLoading} navigate={navigate} />}
        />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/users/:id" element={<UserDetail />} />
      </Routes>
    </div>
  );
}

export default App;
// and a book club section with a link to join the club.
// It also includes a dark mode toggle and a search bar for user queries.