// Login.js (with Admin Mode Switch)
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = ({ setError = () => {}, setLoading = () => {} }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [adminMode, setAdminMode] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.fromSignup) {
      setMessage('🎉 Signup successful! Please log in.');
    } else {
      setMessage('');
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setErrorMessage('');
    setLoading(true);

    try {
      const { data } = await axios.post('https://user-lookup-app.onrender.com/users/login', formData);

      const { token, user } = data;

      if (!token || !user) {
        setErrorMessage('Invalid response from server.');
        return;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('loggedInUser', JSON.stringify(user));
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      localStorage.setItem('tokenExpiry', expiresAt.toISOString());

      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMessage(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-section">
      <h2>🔐 Login</h2>
      {message && <p className="message">{message}</p>}

      <form onSubmit={handleLogin}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1rem' }}>
          <label style={{ marginRight: '0.5rem' }}>Admin Mode</label>
          <input
            type="checkbox"
            checked={adminMode}
            onChange={(e) => setAdminMode(e.target.checked)}
          />
        </div>

        <button type="submit" className="btn-primary">Login</button>
      </form>

      {errorMessage && <p className="error">{errorMessage}</p>}

      {adminMode && (
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button className="btn-secondary" onClick={() => navigate('/admin')}>
            👑 Admin Access
          </button>
        </div>
      )}
    </div>
  );
};

export default Login;
