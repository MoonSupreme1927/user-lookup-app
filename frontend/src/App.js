
import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', phone: '' });

  const handleSearch = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await axios.get(`https://user-lookup-app.onrender.com/search?query=${query}`);
      setResults(response.data);
    } catch (err) {
      console.error('API call failed:', err);
      setError('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await axios.post(
        'https://user-lookup-app.onrender.com/add',
        newUser
      );
      console.log(response.data);

      // Refresh user list with new user
      setQuery(newUser.name);
      const searchResponse = await axios.get(`https://user-lookup-app.onrender.com/search?query=${newUser.name}`);
      setResults(searchResponse.data);

      setNewUser({ name: '', email: '', phone: '' });
    } catch (err) {
      console.error('Add user failed:', err);
      setError('Failed to add user');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setError(null);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  return (
    <>
      <div className="banner">User Lookup Tool</div>
  
      {loading && (
        <div className="overlay">
          <div className="spinner"></div>
        </div>
      )}
  
      <div className="App">
        <div className="form-container">
          {/* Search User Section */}
          <div className="form-section">
            <h2>Search User</h2>
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search by name, email, or phone"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button type="submit" className="btn-primary" disabled={loading}>Search</button>
              <button type="button" className="btn-secondary" onClick={handleClear}>Clear</button>
            </form>
          </div>
  
          {/* Add User Section */}
          <div className="form-section">
            <h2>Add a User</h2>
            <form onSubmit={handleAddUser}>
              <input
                type="text"
                placeholder="Name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Phone"
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                required
              />
              <button type="submit" className="btn-primary" disabled={loading}>Add User</button>
            </form>
          </div>
        </div>
  
        {/* Results */}
        {error && <p className="error">{error}</p>}
        {results.length > 0 ? (
          results.map((user, index) => (
            <div key={index} className="user-card">
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Phone:</strong> {user.phone}</p>
            </div>
          ))
        ) : (
          query && !loading && !error && <p className="error">No results found.</p>
        )}
      </div>
    </>
  );
  
}

export default App;


