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
      const response = await axios.post('https://user-lookup-app.onrender.com/forgot-password', { email });
      setMessage(response.data.message || 'Check your email for the reset link.');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="form-section" style={{ maxWidth: '400px', margin: 'auto', paddingTop: '2rem' }}>
      <h2>🔑 Forgot Password</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '0.5rem' }}
        />
        <button type="submit" className="btn-primary">Submit</button>
      </form>

      {message && <p className="success" style={{ color: 'green', marginTop: '1rem' }}>{message}</p>}
      {error && <p className="error" style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
    </div>
  );
};

export default ForgotPassword;
