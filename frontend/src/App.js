import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import LandingPage from './LandingPage';
import Login from './Login';
import Signup from './Signup';
import Dashboard from './Dashboard';
import ResetPassword from './ResetPassword';
import ForgotPassword from './ForgotPassword';
import UserDetail from './UserDetail';
import ProtectedRoutes from './ProtectedRoutes';
import AdminDashboard from './AdminDashboard';
import AdminBookForm from './AdminBookForm';

function App() {
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', phone: '' });
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  const navigate = useNavigate();
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  const isAdmin = loggedInUser?.role === 'admin';

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (query.trim()) searchUsers(query);
    }, 500);
    return () => clearTimeout(delaySearch);
  }, [query]);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

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
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className={darkMode ? 'app dark-mode' : 'app'}>
      <header className="banner">
        <div className="banner-top">
          <Link to="/" className="banner-title" style={{ textDecoration: 'none', color: 'inherit' }}>The SHElf Society </Link>
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
          <button className="btn-secondary" onClick={() => navigate('/signup')}>📝 Sign Up</button>
          <button className="btn-secondary" onClick={() => navigate('/login')}>🔐 Login</button>
          <button className="btn-secondary" onClick={() => navigate('/dashboard')}>📊 Dashboard</button>
          {isAdmin && (
            <button className="btn-secondary" onClick={() => navigate('/admin/bookclub')}>🛠️ Admin Panel</button>
          )}
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
          path="/signup"
          element={<Signup setError={setError} setLoading={setLoading} navigate={navigate} />}
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
          path="/dashboard"
          element={
            <ProtectedRoutes>
              <Dashboard setError={setError} setLoading={setLoading} navigate={navigate} />
            </ProtectedRoutes>
          }
        />

        <Route
          path="/admin/bookclub"
          element={
            <ProtectedRoutes>
              {isAdmin ? <AdminBookForm /> : <div style={{ padding: '2rem' }}><h2>⛔ Access Denied</h2><p>You must be an admin to view this page.</p></div>}
            </ProtectedRoutes>
          }
        />

        <Route
          path="/reset-password/:token"
          element={<ResetPassword setError={setError} setLoading={setLoading} navigate={navigate} />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword setError={setError} setLoading={setLoading} navigate={navigate} />}
        />

        <Route
          path="/users/:id"
          element={
            <ProtectedRoutes>
              <UserDetail
                setError={setError}
                setLoading={setLoading}
                navigate={navigate}
              />
            </ProtectedRoutes>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoutes>
              <AdminDashboard
                setError={setError}
                setLoading={setLoading}
                navigate={navigate}
              />
            </ProtectedRoutes>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
