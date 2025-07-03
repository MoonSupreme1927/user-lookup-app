// AdminDashboard.js (Enhanced with Search, Filter, and Analytics)
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
//import './AdminDashboard.css'; // Import your CSS styles
// This component allows admins to view, search, filter, and manage users.
// It includes features for promoting users to admin, deleting users, and displaying user statistics.
//import './styles.css'; // Import additional styles if needed
import './darkMode.css'; // Import dark mode styles if applicable
import './AdminBookFormm.js'; // Import the admin book form component if needed
const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('https://user-lookup-app.onrender.com/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
        setFilteredUsers(res.data);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('You are not authorized to view this page.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const lowerSearch = search.toLowerCase();
    const filtered = users.filter((user) =>
      user.name.toLowerCase().includes(lowerSearch) ||
      user.email.toLowerCase().includes(lowerSearch) ||
      user.role?.toLowerCase().includes(lowerSearch)
    );
    setFilteredUsers(filtered);
  }, [search, users]);

  const handleViewUser = (userId) => {
    navigate(`/users/${userId}`);
  };

  const handleMakeAdmin = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`https://user-lookup-app.onrender.com/admin/users/${userId}/promote`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('User promoted to admin!');
      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId ? { ...user, role: 'admin' } : user
        )
      );
    } catch (err) {
      console.error('Promote failed:', err);
      alert('Failed to promote user.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://user-lookup-app.onrender.com/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter((user) => user._id !== userId));
      alert('User deleted.');
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete user.');
    }
  };

  const totalUsers = users.length;
  const totalAdmins = users.filter((u) => u.role === 'admin').length;
  const totalRegular = totalUsers - totalAdmins;

  if (loading) return <p>Loading users...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="admin-dashboard">
      <h1>👑 Admin Dashboard</h1>

      <div className="analytics">
        <p><strong>Total Users:</strong> {totalUsers}</p>
        <p><strong>Admins:</strong> {totalAdmins}</p>
        <p><strong>Regular Users:</strong> {totalRegular}</p>
      </div>

      <div className="actions">
        <button onClick={() => navigate('/AdminBookForm.js')}>🛠️ Update Book of the Month</button>
      </div>

      <input
        type="text"
        placeholder="Search by name, email, or role"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: '1rem', padding: '0.5rem', width: '100%' }}
      />

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role || 'user'}</td>
              <td>
                <button onClick={() => handleViewUser(user._id)}>View</button>
                {user.role !== 'admin' && (
                  <button onClick={() => handleMakeAdmin(user._id)}>Make Admin</button>
                )}
                <button onClick={() => handleDeleteUser(user._id)} style={{ color: 'red' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
// This code defines an AdminDashboard component that allows administrators to view, search, filter, and manage users.
// It includes features for promoting users to admin, deleting users, and displaying user statistics.