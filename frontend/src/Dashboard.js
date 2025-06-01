import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts';
//import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch user + books on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to view this page.');
      return;
    }

    const fetchUserAndBooks = async () => {
      try {
        const [userRes, booksRes] = await Promise.all([
          axios.get('https://user-lookup-app.onrender.com/dashboard', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('https://user-lookup-app.onrender.com/books', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setUser(userRes.data.user);
        setBooks(booksRes.data);
      } catch (err) {
        console.error(err);
        setError('Access denied or session expired.');
      }
    };

    fetchUserAndBooks();
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUser');
    navigate('/login');
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      const res = await axios.get(
        `https://user-lookup-app.onrender.com/search?query=${query}`
      );
      setResults(res.data);
    } catch (err) {
      console.error('Search error', err);
    }
  };

  const bookOfTheMonth = books.reduce(
    (top, b) => (b.votes > (top?.votes || 0) ? b : top),
    null
  );

  if (error) return <p className="error">{error}</p>;

  return user ? (
    <div className="dashboard">
      <div className="banner" style={styles.banner}>
        <span style={styles.title}>🔍 User Lookup Tool</span>
        <form onSubmit={handleSearch} style={styles.searchForm}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users..."
            style={styles.input}
          />
          <button type="submit">Search</button>
        </form>
        <button onClick={handleLogout}>🚪 Logout</button>
      </div>

      <div className="books-section" style={{ marginTop: '1rem' }}>
        <h3>📚 Books Chart</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={books}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="title" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="votes" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {bookOfTheMonth && (
        <div className="book-of-month-banner" style={styles.bookBanner}>
          <h2>📘 Book of the Month:</h2>
          <p>
            <strong>{bookOfTheMonth.title}</strong> by {bookOfTheMonth.author}
          </p>
        </div>
      )}

      <h3>📢 Vote for Book of the Month</h3>
      <ul>
        {books.map((book) => (
          <li key={book._id} style={{ marginBottom: '1rem' }}>
            <strong>{book.title}</strong> by {book.author} — {book.votes} votes
            <button
              onClick={() => handleVote(book._id)}
              style={{ marginLeft: '1rem', cursor: 'pointer' }}
            >
              👍 Vote
            </button>
          </li>
        ))}
      </ul>

      <div className="welcome-section" style={{ marginTop: '1rem' }}>
        <h2>Welcome, {user.name}!</h2>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Phone:</strong> {user.phone}
        </p>
        <p>
          <strong>Role:</strong> {user.role || 'user'}
        </p>
      </div>

      {results.length > 0 && (
        <div className="results" style={{ marginTop: '1rem' }}>
          <h3>Search Results:</h3>
          <ul>
            {results.map((r) => (
              <li key={r._id}>
                {r.name} - {r.email}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  ) : (
    <p>Loading dashboard...</p>
  );
};

const styles = {
  banner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.5rem 1rem'
  },
  title: {
    fontWeight: 'bold',
    fontSize: '1.2rem'
  },
  searchForm: {
    display: 'flex',
    gap: '0.5rem'
  },
  input: {
    padding: '0.25rem 0.5rem'
  },
  bookBanner: {
    background: '#ffdd57',
    padding: '1rem',
    marginTop: '2rem',
    borderRadius: '8px',
    textAlign: 'center',
    animation: 'pulse 2s infinite'
  }
};

export default Dashboard;
