import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = ({ setError, setLoading, navigate, setQuery, setResults, setNewUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setErrorMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await axios.post('https://user-lookup-app.onrender.com/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('loggedInUser', JSON.stringify(user));
      navigate(`/users/${user._id}`);
    } catch (err) {
      setErrorMessage(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password'); // Navigates to Forgot Password page
  };

  return (
    <div className="form-section">
      <h2>🔐 Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="btn-primary">Login</button>
      </form>

      {error && <p className="error">{error}</p>}

      <button className="btn-secondary" onClick={handleForgotPassword}>
        Forgot Password?
      </button>
    </div>
  );
};

export default Login;
