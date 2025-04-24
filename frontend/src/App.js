import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Home from './Home';
import UserDetail from './UserDetail';
import Login from './Login';
import Signup from './Signup';
import Dashboard from './Dashboard';
import './App.css';

function App() {
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', phone: '' });
  const [darkMode, setDarkMode] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (query.trim()) {
        searchUsers(query);
      }
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
      console.error('API call failed:', err);
      setError('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    if (query.trim()) {
      await searchUsers(query);
    }
  };

  const handleAddUser = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await axios.post('https://user-lookup-app.onrender.com/add', newUser);
      const response = await axios.get(`https://user-lookup-app.onrender.com/search?query=${newUser.name}`);
      setResults(response.data);
      setNewUser({ name: '', email: '', phone: '' });
      setQuery(newUser.name);
    } catch (err) {
      console.error('Add user failed:', err);
      setError('Failed to add user');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setError(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    navigate('/login');
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setNewUser(user);
    }
  }, []);

  return (
    <>
      <div className="banner">
        User Lookup Tool
        <button className="btn-secondary" onClick={() => navigate('/login')} style={{ marginLeft: '1rem' }}>
          🔐 Login
        </button>
        <button className="dark-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
        <button className="btn-secondary" onClick={handleLogout}>
          🚪 Logout
        </button>
        <button className="btn-secondary" onClick={() => navigate('/signup')}>
          📝 Sign Up
        </button>
        <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
          📊 Dashboard
        </button>
      </div>

      {location.pathname !== '/' && (
        <div className="back-container">
          <button className="btn-secondary back-button" onClick={() => navigate(-1)}>
            🔙 Back
          </button>
        </div>
      )}

      {loading && (
        <div className="overlay">
          <div className="spinner"></div>
        </div>
      )}

      <Routes>
        <Route
          path="/"
          element={
            <Home
              query={query}
              setQuery={setQuery}
              results={results}
              error={error}
              loading={loading}
              newUser={newUser}
              setNewUser={setNewUser}
              darkMode={darkMode}
              handleSearch={handleSearch}
              handleAddUser={handleAddUser}
              navigate={navigate}
            />
          }
        />
        <Route path="/users/:id" element={<UserDetail />} />
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
      </Routes>
    </>
  );
}

export default App;
