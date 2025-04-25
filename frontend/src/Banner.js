import React from 'react';

const Banner = ({ query, setQuery, handleSearch, handleLogout }) => {
  return (
    <div className="banner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 1rem' }}>
      <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>🔍 User Lookup Tool</span>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users..."
          style={{ padding: '0.25rem 0.5rem' }}
        />
        <button type="submit">Search</button>
      </form>

      <button onClick={handleLogout} style={{ marginLeft: '1rem' }}>
        🚪 Logout
      </button>
    </div>
  );
};

export default Banner;
