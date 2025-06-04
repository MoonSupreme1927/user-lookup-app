import axios from 'axios';

const API_BASE = 'https://user-lookup-app.onrender.com';

export const fetchUserById = (id) => axios.get(`${API_BASE}/users/${id}`);

export const fetchSkillsByUserId = (id) => axios.get(`${API_BASE}/skills/${id}`);

export const addSkillToUser = (id, skill) =>
  axios.post(`${API_BASE}/skills/${id}`, { skill });

export const removeSkillFromUser = (id, skill) =>
  axios.delete(`${API_BASE}/skills/${id}/${skill}`);
