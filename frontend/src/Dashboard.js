import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return setError('You must be logged in to view this page.');

    axios.get('https://user-lookup-app.onrender.com/dashboard', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(res => {
      setUser(res.data.user);
    }).catch(err => {
      setError('Access denied or session expired.');
      console.error(err);
    });
  }, []);

  if (error) return <p className="error">{error}</p>;

  return user ? (
    <div className="App">
      <h2>Welcome, {user.name}!</h2>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Phone:</strong> {user.phone}</p>
      <p><strong>Role:</strong> {user.role || 'user'}</p>
    </div>
  ) : (
    <p>Loading dashboard...</p>
  );
};

export default Dashboard;
