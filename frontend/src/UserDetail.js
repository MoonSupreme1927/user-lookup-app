import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchUserById, fetchSkillsByUserId, addSkillToUser, removeSkillFromUser } from '/services/userService';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  const isOwner = loggedInUser?._id === id;

  useEffect(() => {
    const fetchUserAndSkills = async () => {
      try {
        const [userRes, skillRes] = await Promise.all([
          fetchUserById(id),
          fetchSkillsByUserId(id),
        ]);
        setUser(userRes.data);
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
    const trimmed = newSkill.trim();
    if (!trimmed || skills.includes(trimmed)) return setNewSkill('');

    try {
      const res = await addSkillToUser(id, trimmed);
      setSkills(res.data.skills);
      setNewSkill('');
    } catch (err) {
      console.error('Failed to add skill:', err);
    }
  };

  const handleRemoveSkill = async (skillToRemove) => {
    try {
      const res = await removeSkillFromUser(id, skillToRemove);
      setSkills(res.data.skills);
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
        <div className="header">
          <h1>User Profile</h1>
          <button className="btn-secondary" onClick={() => navigate('/')}>
            ⬅️ Back to Search
          </button>
        </div>

        <div className="contact-card">
          <h2>👤 Contact Info</h2>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Phone:</strong> {user.phone}</p>
        </div>

        <div className="skills-card">
          <h2>💼 Skills</h2>
          {skills.length > 0 ? (
            <ul>
              {skills.map((skill, idx) => (
                <li key={idx}>
                  {skill}
                  {isOwner && (
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="remove-skill-btn"
                    >
                      ❌
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>No skills listed.</p>
          )}

          {isOwner && (
            <div className="add-skill-form">
              <input
                type="text"
                placeholder="Add a new skill"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
              />
              <button onClick={handleAddSkill}>➕ Add</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
