const Banner = ({ query, setQuery, handleSearch, handleLogout }) => {
    return (
      <div className="banner">
        <span>User Lookup Tool</span>
        
        <form
          onSubmit={handleSearch}
          style={{ position: 'absolute', right: '1rem', top: '0.5rem' }}
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users..."
          />
          <button type="submit">🔍</button>
        </form>
  
        <button onClick={handleLogout}>🚪 Logout</button>
      </div>
    );
  };
  