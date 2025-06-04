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
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to view this page.');
      return;
    }

    const fetchUserBooksSkills = async () => {
      try {
        const userRes = await axios.get('https://user-lookup-app.onrender.com/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userRes.data.user);

        const [booksRes, skillsRes] = await Promise.all([
          axios.get('https://user-lookup-app.onrender.com/books', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`https://user-lookup-app.onrender.com/skills/${userRes.data.user._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        setBooks(booksRes.data);
        setSkills(skillsRes.data.skills);
      } catch (err) {
        console.error(err);
        setError('Access denied or session expired.');
      }
    };

    fetchUserBooksSkills();
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

  const handleAddSkill = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const { data } = await axios.post(
        `https://user-lookup-app.onrender.com/skills/${user._id}`,
        { skill: newSkill },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSkills(data.skills);
      setNewSkill('');
    } catch (err) {
      console.error('Add skill error:', err);
    }
  };

  const handleDeleteSkill = async (skill) => {
    const token = localStorage.getItem('token');
    try {
      const { data } = await axios.delete(
        `https://user-lookup-app.onrender.com/skills/${user._id}/${skill}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSkills(data.skills);
    } catch (err) {
      console.error('Delete skill error:', err);
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

      <div className="vote-banner" style={styles.voteBanner}>
        <h2>📘 Book of the Month:</h2>
        {bookOfTheMonth ? (
          <p><strong>{bookOfTheMonth.title}</strong> by {bookOfTheMonth.author}</p>
        ) : (
          <p>No votes yet.</p>
        )}
        <a
          href="https://docs.google.com/forms/d/1hD0ojVkqI2MDuPKgwG5I5f6ILroe1WJ_euVlp_n0LlQ"
          target="_blank"
          rel="noopener noreferrer"
          className="vote-button"
        >
          🗳️ Vote for Book of the Month
        </a>
      </div>

      <h3>📢 Current Votes</h3>
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

      <div className="skills-section" style={{ marginTop: '2rem' }}>
        <h3>🧠 Your Skills</h3>
        <form onSubmit={handleAddSkill} style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="Add a new skill"
          />
          <button type="submit">➕ Add Skill</button>
        </form>

        {skills.length === 0 ? (
          <p>No skills found.</p>
        ) : (
          <ul>
            {skills.map((skill, index) => (
              <li key={index}>
                {skill}
                <button
                  onClick={() => handleDeleteSkill(skill)}
                  style={{ marginLeft: '1rem', color: 'red' }}
                >
                  ❌ Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="welcome-section" style={{ marginTop: '1rem' }}>
        <h2>Welcome, {user.name}!</h2>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Phone:</strong> {user.phone}</p>
        <p><strong>Role:</strong> {user.role || 'user'}</p>
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
  voteBanner: {
    textAlign: 'center',
    marginTop: '2rem'
  }
};

export default Dashboard;
// Dashboard.js