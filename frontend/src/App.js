import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import { Routes, Route, useNavigate } from 'react-router-dom';
import UserDetail from './UserDetail';

function App() {
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', phone: '' });
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await axios.get(`https://user-lookup-app.onrender.com/search?query=${query}`);
      setResults(response.data);
    } catch (err) {
      console.error('API call failed:', err);
      setError('Error loading data');
    } finally {
      setLoading(false);
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

  const Home = () => (
    <div className={darkMode ? 'App dark' : 'App'}>
      <div className="form-container">
        <div className="form-section">
          <h2>🔍 Search User</h2>
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search by name, email, or phone"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="btn-primary" disabled={loading}>Search</button>
            <button type="button" className="btn-secondary" onClick={handleClear}>Clear</button>
          </form>
        </div>

        <div className="form-section">
          <h2>➕ Add a User</h2>
          <form onSubmit={handleAddUser}>
            <input type="text" placeholder="Name" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} required />
            <input type="email" placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} required />
            <input type="text" placeholder="Phone" value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} required />
            <button type="submit" className="btn-primary" disabled={loading}>Add User</button>
          </form>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      {results.length > 0 ? (
        results.map((user, index) => (
          <div key={index} className="user-card">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Phone:</strong> {user.phone}</p>
            <button
              className="btn-secondary"
              onClick={() => navigate(`/users/${user._id}`)}
            >
              View User Page
            </button>
          </div>
        ))
      ) : (
        query && !loading && !error && <p className="error">No results found.</p>
      )}
    </div>
  );

  return (
    <>
      <div className="banner">
        User Lookup Tool
        <button className="dark-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>

      {loading && (
        <div className="overlay">
          <div className="spinner"></div>
        </div>
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/users/:id" element={<UserDetail />} />
      </Routes>
    </>
  );
}

export default App;
