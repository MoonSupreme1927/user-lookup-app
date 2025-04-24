import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const res = await axios.post('https://user-lookup-app.onrender.com/signup', formData);
      setMessage('Signup successful! Redirecting...');
      
      // Optionally log the user in right after signup
      const loginRes = await axios.post('https://user-lookup-app.onrender.com/login', {
        email: formData.email,
        password: formData.password
      });

      localStorage.setItem('loggedInUser', JSON.stringify(loginRes.data.user));
      navigate(`/users/${loginRes.data.user._id}`);
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <div className="App">
      <div className="form-section">
        <h2>📝 Sign Up</h2>
        <form onSubmit={handleSignup}>
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <button type="submit" className="btn-primary">Create Account</button>
        </form>
        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}

export default Signup;
import './App.css';
import { useEffect } from 'react';
await newUser.save();
await new Skill({ userId: newUser._id, skills: [] }).save();
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';