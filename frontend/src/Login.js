import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const Login = ({ navigate }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const response = await axios.post('https://user-lookup-app.onrender.com/login', formData);
      setMessage(`Welcome, ${response.data.user.name}`);
      // Optional: redirect or store user data
      // navigate(`/users/${response.data.user._id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="App">
      <div className="form-section">
        <h2>🔐 Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <button type="submit" className="btn-primary">Login</button>
        </form>
        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
  localStorage.setItem('loggedInUser', JSON.stringify(response.data.user));
  
};

export default Login;
