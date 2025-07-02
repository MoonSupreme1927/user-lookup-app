// components/AdminBookForm.js
import React, { useState } from 'react';
import axios from 'axios';

const AdminBookForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    coverImage: '',
    audibleLink: '',
    chapters: '', // Comma-separated string like "1-3,4-6,7-9"
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    const token = localStorage.getItem('token');

    try {
      const response = await axios.post(
        'https://user-lookup-app.onrender.com/bookclub/new',
        {
          ...formData,
          chapters: formData.chapters.split(',').map(ch => ch.trim()),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage('✅ Book of the Month updated!');
    } catch (err) {
      console.error(err);
      setMessage('❌ Failed to update book. Make sure you are an admin.');
    }
  };

  return (
    <div className="admin-form-container">
      <h2>🛠️ Update Book of the Month</h2>
      <form onSubmit={handleSubmit} className="admin-book-form">
        <input type="text" name="title" placeholder="Title" value={formData.title} onChange={handleChange} required />
        <input type="text" name="author" placeholder="Author" value={formData.author} onChange={handleChange} required />
        <input type="text" name="coverImage" placeholder="Cover Image URL" value={formData.coverImage} onChange={handleChange} />
        <input type="text" name="audibleLink" placeholder="Audible Link" value={formData.audibleLink} onChange={handleChange} />
        <textarea
          name="chapters"
          placeholder="Chapters (e.g. 1-3, 4-6, 7-9)"
          value={formData.chapters}
          onChange={handleChange}
          required
        ></textarea>
        <button type="submit">🚀 Submit</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default AdminBookForm;
// This component allows admins to update the book of the month, including its title, author, cover image, Audible link, and chapters. It uses Axios to send a POST request to the backend API with the provided data. The form includes basic validation and displays a success or error message based on the response. The chapters are expected to be entered as a comma-separated string which is then split into an array before sending to the backend.
// The component is styled with a simple form layout and includes a submit button to send the data. The form fields are controlled components, meaning their values are managed by React state. When the form is submitted, it prevents the default behavior and sends the data to the server using Axios, handling any errors that may occur during the request.
//  