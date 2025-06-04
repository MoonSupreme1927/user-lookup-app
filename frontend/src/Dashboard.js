import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, Legend, LabelList
} from 'recharts';
import './Dashboard.css';
import '//services/dashboardService';
const Dashboard = () => {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to view this page.');
      return;
    }

    const fetchBooks = async () => {
      try {
        const booksRes = await axios.get('https://user-lookup-app.onrender.com/books', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBooks(booksRes.data);
      } catch (err) {
        console.error(err);
        setError('Access denied or session expired.');
      }
    };

    fetchBooks();
  }, []);

  const handleVote = async (bookId) => {
    const token = localStorage.getItem('token');
    try {
      const { data } = await axios.post(
        `https://user-lookup-app.onrender.com/vote/${bookId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBooks((prev) =>
        prev.map((b) => (b._id === data.book._id ? data.book : b))
      );
    } catch (err) {
      console.error('Vote failed:', err);
    }
  };

  const bookOfTheMonth = books.reduce(
    (top, b) => (b.votes > (top?.votes || 0) ? b : top),
    null
  );

  const genreCounts = books.reduce((acc, book) => {
    acc[book.genre] = (acc[book.genre] || 0) + 1;
    return acc;
  }, {});

  const booksByGenreData = Object.entries(genreCounts).map(([genre, count]) => ({
    genre,
    count
  }));

  if (error) return <p className="error">{error}</p>;

  return (
    <div className="dashboard">
      <button className="btn-secondary" onClick={() => navigate('/UserDetail')}>📊 User Profile</button>
      <div className="book-of-month" style={styles.bookMonth}>
        <h2>📘 Book of the Month</h2>
        <h2>The Vanishing Half</h2>
        <p>by Brit Bennett</p>
        <p>📖 A multi-generational family saga about two twin sisters who choose to live in two different worlds.</p>
        <h2>#NEW YORK BESTSELLER!!</h2>
        {bookOfTheMonth && (
          <p><strong>{bookOfTheMonth.title}</strong> by {bookOfTheMonth.author}</p>
        )}
        <div style={styles.buttonGroup}>
          <a href="https://www.amazon.com/dp/0525536299" target="_blank" rel="noopener noreferrer">
            <button style={styles.button}>📗 GET HARD COPY</button>
          </a>
          <a href="https://www.audible.com/pd/0525637141" target="_blank" rel="noopener noreferrer">
            <button style={styles.button}>🎧 GET AUDIO BOOK</button>
          </a>
        </div>
      </div>

      <div className="club-stats" style={styles.statsContainer}>
        <h3>📊 Club Stats</h3>
        <div style={styles.statsFlex}>
          <div style={styles.statSection}>
            <h4>Total Books Read</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={books} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="title" angle={-45} textAnchor="end" interval={0} height={60} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="readCount" fill="#82ca9d">
                  <LabelList dataKey="readCount" position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={styles.statSection}>
            <h4>Books by Genre</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={booksByGenreData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="genre" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8">
                  <LabelList dataKey="count" position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="vote-banner" style={styles.voteBanner}>
        <a
          href="https://forms.gle/sx5vYqxfNYpdNrhd9"
          target="_blank"
          rel="noopener noreferrer"
          className="vote-button"
        >
          🗳️ Vote for Book of the Month
        </a>
      </div>

      <div className="book-club-suggestions" style={styles.bookMonth}>
        <h2>📚 Book Club Suggestions</h2>
        <a
          href="https://forms.gle/G6YePNbouUcQTJZB8"
          target="_blank"
          rel="noopener noreferrer"
          className="suggestion-button"
          style={styles.suggestionButton}
        >
          📖 Suggest a Book →
        </a>
      </div>
    </div>
  );
};

const styles = {
  bookMonth: {
    textAlign: 'center',
    marginTop: '2rem'
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    marginTop: '1rem'
  },
  button: {
    background: 'none',
    border: '2px solid orange',
    color: 'orange',
    padding: '0.5rem 1rem',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  voteBanner: {
    textAlign: 'center',
    marginTop: '2rem'
  },
  statsContainer: {
    marginTop: '2rem'
  },
  statsFlex: {
    display: 'flex',
    gap: '2rem',
    justifyContent: 'space-between',
    flexWrap: 'wrap'
  },
  statSection: {
    flex: '1 1 45%'
  },
  suggestionButton: {
    textDecoration: 'none',
    color: 'inherit',
    padding: '0.5rem 1rem',
    backgroundColor: '#f0f0f0',
    borderRadius: '5px'
  }
};

export default Dashboard;
// Dashboard.js
// This component fetches and displays book club statistics, including the book of the month and various charts.