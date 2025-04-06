import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  const handleSearch = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.get(
        `https://your-backend-url.onrender.com/search?query=${query}`
      );
      setResults(response.data);
      setError(null); // Clear previous errors
    } catch (err) {
      setError('Error loading data.');
    }
  };

  return (
    <div className="App">
      <h1>User Search</h1>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search by name, email, or phone"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {error && <p>{error}</p>}

      <ul>
        {results.length > 0 ? (
          results.map((user, index) => (
            <li key={index}>
              <strong>{user.name}</strong>
              <p>Email: {user.email}</p>
              <p>Phone: {user.phone}</p>
            </li>
          ))
        ) : (
          <p>No results found</p>
        )}
      </ul>
    </div>
  );
}

export default App;
