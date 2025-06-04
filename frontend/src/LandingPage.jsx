import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div style={styles.page}>
      {/* Banner Section */}
      <header style={styles.banner}>
        <h1>User Lookup App</h1>
        <p>Your hub for managing and searching user data with ease.</p>
      </header>

      {/* Podcast Section */}
      <section style={styles.podcastSection}>
        <h2>🎧 Featured Podcast: Black Chick Lit</h2>
        <p>A bi-monthly podcast celebrating Black women in literature through humor, heart, and honest conversation.</p>
        <iframe style={styles.iframe}
          src="https://open.spotify.com/embed/show/4M3p2cLhTNB0IJrRyXMz5Y?utm_source=generator"
          width="100%"
          height="232"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title="Black Chick Lit Podcast"
        ></iframe>
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
        <Link to="/signup" style={styles.signUpBtn}>JOIN NOW!</Link>
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
  section: {
    padding: '2rem',
    textAlign: 'center',
  },
  podcastSection: {
    background: 'linear-gradient(45deg, #ff6b6b, #feca57, #48dbfb, #1dd1a1)',
    backgroundSize: '600% 600%',
    animation: 'flash 10s ease infinite',
    padding: '2rem',
    marginTop: '2rem',
    borderRadius: '12px',
    color: '#fff',
    textAlign: 'center',
  },
  iframe: {
    borderRadius: '12px',
    marginTop: '1rem',
    maxWidth: '700px',
    width: '100%',
    height: '232px'
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
  signUpBtn: {
    display: 'inline-block',
    marginTop: '1rem',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#007bff',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '5px',
    fontWeight: 'bold',
  }
};

export default LandingPage;
// This code defines a simple landing page for a user lookup application.
// It includes a banner with the app title, a featured podcast section with an embedded Spotify player,