import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import skillsData from './skills.json'; // 👈 import your local JSON file

function UserDetail() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserAndSkills = async () => {
      try {
        const response = await axios.get(`https://user-lookup-app.onrender.com/users/${id}`);
        setUser(response.data);

        const userSkills = skillsData.find((entry) => entry.userId === id);
        setSkills(userSkills ? userSkills.skills : []);
      } catch (err) {
        setError('Failed to fetch user details');
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndSkills();
  }, [id]);

  if (loading) return <p>Loading user details...</p>;
  if (error) return <p>{error}</p>;
  if (!user) return <p>No user found.</p>;

  return (
    <div className="App">
      <div className="detail-container">
        {/* Contact Card */}
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
              {skills.map((skill, index) => (
                <li key={index}>✅ {skill}</li>
              ))}
            </ul>
          ) : (
            <p>No skills listed for this user.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserDetail;

