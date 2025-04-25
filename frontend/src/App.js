import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import Home from './Home';
import UserDetail from './UserDetail';
import Login from './Login';
import Signup from './Signup';
import Dashboard from './Dashboard';
import ResetPassword from './ResetPassword';
import ForgotPassword from './ForgotPassword';

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
    <>
      <div className="banner">
        <span>User Lookup Tool</span>
        <button className="btn-secondary" onClick={() => navigate('/login')}>🔐 Login</button>

        <button className="btn-secondary" onClick={() => navigate('/signup')}>📝 Sign Up</button>

        <button className="btn-secondary" onClick={() => navigate('/dashboard')}>📊 Dashboard</button>

        <button className="btn-secondary" onClick={handleLogout}>🚪 Logout</button>

        <button className="dark-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>

      {loading && <div className="overlay"><div className="spinner" /></div>}

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
              handleSearch={(e) => { e.preventDefault(); searchUsers(query); }}
              handleAddUser={async (e) => {
                e.preventDefault();
                setLoading(true);
                try {
                  await axios.post('https://user-lookup-app.onrender.com/add', newUser);
                  setQuery(newUser.name);
                  setNewUser({ name: '', email: '', phone: '' });
                } catch (err) {
                  setError('Failed to add user');
                } finally {
                  setLoading(false);
                }
              }}
              navigate={navigate}
            />
          }
        />
        
        <Route path="/login" element={<Login setError={setError} setLoading={setLoading} navigate={navigate} setQuery={setQuery} setResults={setResults} setNewUser={setNewUser} />} />
        <Route path="/signup" element={<Signup setError={setError} setLoading={setLoading} navigate={navigate} />} />
        <Route path="/dashboard" element={<Dashboard setError={setError} setLoading={setLoading} navigate={navigate} />} />
        <Route path="/users/:id" element={<UserDetail />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} /> 
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    </>
  );
}

export default App;
