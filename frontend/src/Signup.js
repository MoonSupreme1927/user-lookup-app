import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (formData.password !== formData.confirmPassword) {
      setError('❗ Passwords do not match');
      return;
    }

    try {
      const response = await axios.post('/signup', formData);
      setMessage(response.data.message || '🎉 Signup successful!');
      setTimeout(() => navigate('/login', { state: { fromSignup: true } }), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const response = await axios.post('/reset-password', { email: formData.email });
      setMessage(response.data.message || '📬 Reset link sent to your email');
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed. Try again.');
    }
  };

  return (
    <div className="form-section">
      <h2>📝 Sign Up</h2>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={formData.phone}
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
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
        <button className="btn-primary" type="submit">Sign Up</button>
      </form>

      <h3>🔑 Forgot Password?</h3>
      <form onSubmit={handleResetPassword}>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <button className="btn-secondary" type="submit">Send Reset Link</button>
      </form>
    </div>
  );
};

export default Signup;
