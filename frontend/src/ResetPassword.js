import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirm) {
      setError('❗ Passwords do not match');
      return;
    }

    try {
      const response = await axios.post(`https://user-lookup-app.onrender.com/reset-password/${token}`, { password });
      setMessage(response.data.message || '✅ Password reset successful!');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      console.error('Reset error:', err);
      setError(err.response?.data?.error || 'Reset failed. Please try again.');
    }
  };

  return (
    <div className="form-section">
      <h2>🔐 Reset Password</h2>
      <form onSubmit={handleReset}>
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        <button className="btn-primary" type="submit">
          Reset Password
        </button>
      </form>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default ResetPassword;
