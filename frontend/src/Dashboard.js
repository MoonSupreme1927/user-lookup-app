import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return setError('You must be logged in to view this page.');

    axios
      .get('https://user-lookup-app-frontend.onrender.com/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data.user))
      .catch((err) => {
        console.error(err);
        setError('Access denied or session expired.');
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUser');
    navigate('/login');
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    try {
      const res = await axios.get(`https://user-lookup-app.onrender.com/search?query=${query}`);
      setResults(res.data);
    } catch (err) {
      console.error('Search error', err);
    }
  };

  if (error) return <p className="error">{error}</p>;

  return user ? (
    <div className="dashboard">
      <div
        className="banner"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.5rem 1rem',
        }}
      >
        <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>🔍 User Lookup Tool</span>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users..."
            style={{ padding: '0.25rem 0.5rem' }}
          />
          <button type="submit">Search</button>
        </form>

        <button onClick={handleLogout}>🚪 Logout</button>
      </div>

      <div className="welcome-section" style={{ marginTop: '1rem' }}>
        <h2>Welcome, {user.name}!</h2>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Phone:</strong> {user.phone}</p>
        <p><strong>Role:</strong> {user.role || 'user'}</p>
      </div>

      {results.length > 0 && (
        <div className="results" style={{ marginTop: '1rem' }}>
          <h3>Search Results:</h3>
          <ul>
            {results.map((r) => (
              <li key={r._id}>
                {r.name} - {r.email}
              </li>
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
