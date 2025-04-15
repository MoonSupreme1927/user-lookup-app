
import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  const handleSearch = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const apiUrl = `https://user-lookup-app.onrender.com/search?query=${query}`;

    try {
      const response = await axios.get(apiUrl);
      setResults(response.data);
    } catch (err) {
      console.error('API call failed:', err);
      setError('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>User Lookup</h1>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search by name, email, or phone"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {loading && <div className="spinner"></div>}
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
  );
}

export default App;
