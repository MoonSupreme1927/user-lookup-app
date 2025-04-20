// Layout.js
import React from 'react';
import './App.css';

const Layout = ({ darkMode, toggleDarkMode, children }) => (
  <>
    <div className="banner">
      User Lookup Tool
      <button className="dark-toggle" onClick={toggleDarkMode}>
        {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
      </button>
    </div>

    {children}
  </>
);

export default Layout;
