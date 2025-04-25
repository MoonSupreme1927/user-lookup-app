// Layout.js
import React from 'react';
import './App.css';

const Layout = ({ darkMode, toggleDarkMode, children }) => {
  return (
    <div className={darkMode ? 'App dark' : 'App'}>
      <header className="banner">
        User Lookup Tool
        <button className="dark-toggle" onClick={toggleDarkMode}>
          {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </header>
      <main>{children}</main>
    </div>
  );
};

export default Layout;
