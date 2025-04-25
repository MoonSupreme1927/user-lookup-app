import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const Login = ({ setError, setLoading, navigate, setQuery, setResults, setNewUser }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const location = useLocation();

  useEffect(() => {
    if (location.state?.fromSignup) {
      setMessage('🎉 Signup successful! Please log in.');
    }
  }, [location]);

  // ...rest of your login logic

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    navigate('/dashboard');
    try {
      const response = await axios.post('https://user-lookup-app-frontend.onrender.com/login', { email, password });
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
