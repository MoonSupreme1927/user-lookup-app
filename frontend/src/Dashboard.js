import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  LabelList
} from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to view this page.');
      return;
    }

    const fetchData = async () => {
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

    fetchData();
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

  return user ? (
    <div className="dashboard">
      <div className="book-of-month" style={styles.bookMonth}>
        <h2>📘 Book of the Month</h2>
        <h2>The Vanishing Half</h2>
        <p>by Brit Bennett</p>
        <p>📖 A multi-generational family saga about two twin sisters who choose to live in two different worlds.</p>
        <h2>#NEW YORK BESTSELLER!!</h2>
        {bookOfTheMonth ? (
          <p><strong>{bookOfTheMonth.title}</strong> {bookOfTheMonth.author}by</p>
        ) : (
          <p></p>
        )}
        <div style={styles.buttonGroup}>
          <a href="https://www.amazon.com/dp/0525536299/?bestFormat=true&k=the%20vanishing%20half&ref_=nb_sb_ss_w_scx-ent-pd-bk-d_de_k0_1_9&crid=1YZ7EA9TYXNNH&sprefix=the%20vanis" target="_blank" rel="noopener noreferrer">
            <button style={{ background: 'none', border: '2px solid orange', color: 'orange', padding: '0.5rem 1rem', borderRadius: '5px', cursor: 'pointer' }}>📗 GET HARD COPY</button>
          </a>
          <a href="https://www.audible.com/pd/0525637141?source_code=ORGOR69210072400FU" target="_blank" rel="noopener noreferrer">
          <button style={{ background: 'none', border: '2px solid orange', color: 'orange', padding: '0.5rem 1rem', borderRadius: '5px', cursor: 'pointer' }}> 🎧 GET AUDIO BOOK</button>
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

      <div
      className='book-club-suggestions' style={styles.bookMonth}>
      <h2>📚 Book Club Suggestions</h2>
          <a
            href="https://forms.gle/G6YePNbouUcQTJZB8"
            target="_blank"
            rel="noopener noreferrer"
            className="suggestion-button"
            style={{ textDecoration: 'none', color: 'inherit', padding: '0.5rem 1rem', backgroundColor: '#f0f0f0', borderRadius: '5px' }}
          >
            Suggest a Book →
          </a>
      </div>

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

      <div className="welcome-section" style={{  maringCenter: '1rem', marginTop: '1rem' }}>
        <h2>Welcome, {user.name}!</h2>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Phone:</strong> {user.phone}</p>
        <p><strong>Role:</strong> {user.role || 'user'}</p>
      </div>
    </div>
  ) : (
    <p>Loading dashboard...</p>
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
  }
};

export default Dashboard;