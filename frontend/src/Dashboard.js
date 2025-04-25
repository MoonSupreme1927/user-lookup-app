import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return setError('You must be logged in to view this page.');

    axios.get('https://user-lookup-app-frontend.onrender.com/dashboard', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(res => {
      setUser(res.data.user);
    }).catch(err => {
      setError('Access denied or session expired.');
      console.error(err);
    });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUser');
    navigate('/login');
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.get(`https://user-lookup-app.onrender.com/search?query=${query}`);
      setResults(res.data);
    } catch (err) {
      console.error('Search error', err);
    }
  };

  if (error) return <p className="error">{error}</p>;

  return user ? (
    <div className="App">
      <div className="banner">
        <span>User Lookup Tool</span>

        <form
          onSubmit={handleSearch}
          style={{ position: 'absolute', right: '1rem', top: '0.5rem' }}
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users..."
          />
          <button type="submit">🔍</button>
        </form>

        <button onClick={handleLogout} style={{ marginLeft: '1rem' }}>🚪 Logout</button>
      </div>

      <h2>Welcome, {user.name}!</h2>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Phone:</strong> {user.phone}</p>
      <p><strong>Role:</strong> {user.role || 'user'}</p>

      {results.length > 0 && (
        <div className="results">
          <h3>Search Results:</h3>
          <ul>
            {results.map((r) => (
              <li key={r._id}>{r.name} - {r.email}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  ) : (
    <p>Loading dashboard...</p>
  );
};

export default Dashboard;
