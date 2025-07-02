import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, Legend, LabelList
} from 'recharts';
import './Dashboard.css';
import './services/dashboardService';
import { useNavigate } from 'react-router-dom';
import { fetchUserById } from './services/userService';
const Dashboard = () => {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  const isOwner = loggedInUser?._id === id;
  const id = loggedInUser?._id;
  // Check if the user is logged in and has a valid token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to view this page.');
      return;
    }
    const fetchUser = async () => {
      try {
        const userRes = await fetchUserById(id);
        if (!userRes.data) {
          setError('User not found.');
          return;
        }
        // You can set user data in state if needed
      } catch (err) {
        console.error('Failed to fetch user:', err);
        setError('Failed to fetch user data.');
      }
    };
    fetchUser();
  }, [id]);

  0
  
  // Fetch books and user data on component mount

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
      
      {loggedInUser && (
  <button className="btn-secondary" onClick={() => navigate(`/users/${loggedInUser._id}`)}>
    📊 User Profile
  </button>
)}

      <div className="book-of-month" style={styles.bookMonth}>
        <h2>📘 Book of the Month</h2>
        <h2>Heavy</h2>
        <p>by Kiese Laymon</p>
        <p>📖 AN AMERICAN MEMOIR</p>
        {/* <h2>#NEW YORK BESTSELLER!!</h2> */}
        {bookOfTheMonth && (
          <p><strong>{bookOfTheMonth.title}</strong> by {bookOfTheMonth.author}</p>
        )}
        <div style={styles.buttonGroup}>
          <a href="https://www.amazon.com/Heavy-American-Memoir-Kiese-Laymon/dp/1501125664" target="_blank" rel="noopener noreferrer">
            <button style={styles.button}>📗 GET HARD COPY</button>
          </a>
          <a href="https://www.audible.com/pd/Heavy-Audiobook/B07CPGYSFQ" target="_blank" rel="noopener noreferrer">
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