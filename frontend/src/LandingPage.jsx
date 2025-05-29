import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div style={styles.page}>
      {/* Banner Section */}
      <header style={styles.banner}>
        <h1>User Lookup App</h1>
        <p>Your hub for managing and searching user data with ease.</p>
        <Link to="/login" style={styles.loginBtn}>Login</Link>
      </header>

      {/* News Section */}
      <section style={styles.section}>
        <h2>📺 Today's News</h2>
        <div style={styles.newsBox}>
          <iframe
            title="MSNBC Live"
            width="100%"
            height="315"
            src="https://www.youtube.com/watch?v=g5e5ZhUneyM"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </section>

      {/* Book Club Section */}
      <section style={styles.section}>
        <h2>📚 Book Club Suggestions</h2>
        <div style={styles.bookClubBox}>
          <p>Join our monthly book club and share your recommendations!</p>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSeZzUQJGOOGLEFORMURL/viewform"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.bookClubLink}
          >
            Suggest a Book →
          </a>
        </div>
      </section>

      <section style={styles.section}>
        <h2>Join our monthly Bookclub!!</h2>
        <p>See bookclub readers list</p>
        <Link to="/search" style={styles.loginBtn}>JOIN NOW!</Link>
      </section>
    </div>
  );
};

const styles = {
  page: {
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  banner: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '2rem',
    textAlign: 'center',
  },
  loginBtn: {
    display: 'inline-block',
    marginTop: '1rem',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#ffffff',
    color: '#007bff',
    textDecoration: 'none',
    borderRadius: '5px',
    fontWeight: 'bold',
  },
  section: {
    padding: '2rem',
    textAlign: 'center',
  },
  newsBox: {
    marginTop: '1rem',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    maxWidth: '700px',
    margin: 'auto',
  },
  bookClubBox: {
    marginTop: '1rem',
    padding: '1rem',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    maxWidth: '500px',
    margin: '1rem auto',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  bookClubLink: {
    marginTop: '1rem',
    display: 'inline-block',
    color: '#007bff',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
};

export default LandingPage;
// This code defines a simple landing page for a user lookup application.
// It includes a banner with a login button, a news section displaying a live MSNBC stream,