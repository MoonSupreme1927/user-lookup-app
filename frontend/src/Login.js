import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = ({ setError, setLoading }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  // Display message if navigated from signup
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
      const { data } = await axios.post('https://user-lookup-app.onrender.com/login', formData);
      const { token, user } = data;

      if (!token || !user) {
        setErrorMessage('Invalid response from server.');
        return;
      }

      // Store token & user info
      localStorage.setItem('token', token);
      localStorage.setItem('loggedInUser', JSON.stringify(user));

      // Optional: store token expiry time (if you want to auto-expire)
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
      localStorage.setItem('tokenExpiry', expiresAt.toISOString());

      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setErrorMessage(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
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
        <button type="submit" className="btn-primary">Login</button>
      </form>

      {errorMessage && <p className="error">{errorMessage}</p>}

      <button type="button" className="btn-secondary" onClick={handleForgotPassword}>
        Forgot Password?
      </button>
    </div>
  );
};

export default Login;
