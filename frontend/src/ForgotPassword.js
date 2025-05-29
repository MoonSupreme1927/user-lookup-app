// src/ForgotPassword.js
import React, { useState } from 'react';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await axios.post('https://user-lookup-app.onrender.com/reset-password', { email });
      setMessage(response.data.message || '📬 Reset link sent!');
    } catch (err) {
      setError(err.response?.data?.error || '❌ Failed to send reset link');
    }
  };

  return (
    <div className="form-section">
      <h2>🔁 Forgot Password</h2>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button className="btn-primary" type="submit">Send Reset Link</button>
      </form>
    </div>
  );
};

export default ForgotPassword;
