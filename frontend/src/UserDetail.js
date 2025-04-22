import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function UserDetail() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user + skills
  useEffect(() => {
    const fetchUserAndSkills = async () => {
      try {
        const userRes = await axios.get(`https://user-lookup-app.onrender.com/users/${id}`);
        setUser(userRes.data);

        const skillRes = await axios.get(`https://user-lookup-app.onrender.com/skills/${id}`);
        setSkills(skillRes.data.skills || []);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch user details');
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndSkills();
  }, [id]);

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return;
    if (skills.includes(newSkill.trim())) {
      setNewSkill('');
      return;
    }

    try {
      const response = await axios.post(`https://user-lookup-app.onrender.com/skills/${id}`, {
        skill: newSkill.trim(),
      });
      setSkills(response.data.skills);
      setNewSkill('');
    } catch (err) {
      console.error('Failed to add skill:', err);
    }
  };

  const handleRemoveSkill = async (skillToRemove) => {
    try {
      const response = await axios.delete(
        `https://user-lookup-app.onrender.com/skills/${id}/${skillToRemove}`
      );
      setSkills(response.data.skills);
    } catch (err) {
      console.error('Failed to remove skill:', err);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!user) return <p>No user found.</p>;

  return (
    <div className="App">
      <div className="detail-container">
        {/* Contact Info */}
        <div className="contact-card">
          <h2>👤 Contact Info</h2>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Phone:</strong> {user.phone}</p>
        </div>

        {/* Skills Section */}
        <div className="skills-card">
          <h2>💼 Skills</h2>
          {skills.length > 0 ? (
            <ul>
              {skills.map((skill, idx) => (
                <li key={idx}>
                  {skill}
                  <button onClick={() => handleRemoveSkill(skill)}>❌</button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No skills listed.</p>
          )}

          <div className="add-skill-form">
            <input
              type="text"
              placeholder="Add a new skill"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
            />
            <button onClick={handleAddSkill}>➕ Add</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDetail;
// Compare this snippet from frontend/src/App.js: 
// import React, { useState } from 'react';
