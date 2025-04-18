const Home = ({
    query,
    setQuery,
    results,
    error,
    loading,
    newUser,
    setNewUser,
    darkMode,
    handleSearch,
    handleAddUser,
    handleClear,
    navigate
  }) => (
    <div className={darkMode ? 'App dark' : 'App'}>
      <div className="form-container">
        <div className="form-section">
          <h2>🔍 Search User</h2>
          <form onSubmit={handleSearch}>
            <input
              type="text"
              autoFocus
              placeholder="Search by name, email, or phone"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="btn-primary" disabled={loading}>Search</button>
            <button type="button" className="btn-secondary" onClick={handleClear}>Clear</button>
          </form>
        </div>
  
        <div className="form-section">
          <h2>➕ Add a User</h2>
          <form onSubmit={handleAddUser}>
            <input type="text" placeholder="Name" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} required />
            <input type="email" placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} required />
            <input type="text" placeholder="Phone" value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} required />
            <button type="submit" className="btn-primary" disabled={loading}>Add User</button>
          </form>
        </div>
      </div>
  
      {error && <p className="error">{error}</p>}
  
      {results.length > 0 ? (
        results.map((user, index) => (
          <div key={index} className="user-card">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Phone:</strong> {user.phone}</p>
            <button
              className="btn-secondary"
              onClick={() => navigate(`/users/${user._id}`)}
            >
              View User Page
            </button>
          </div>
        ))
      ) : (
        query && !loading && !error && <p className="error">No results found.</p>
      )}
    </div>
  );
  export default Home;
// Compare this snippet from frontend/src/UserDetail.js:
// import React, { useEffect, useState } from 'react';  