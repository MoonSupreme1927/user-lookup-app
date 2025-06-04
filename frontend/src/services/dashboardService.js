import axios from 'axios';

const API_BASE = 'https://user-lookup-app.onrender.com';

export const fetchCurrentBook = () => axios.get(`${API_BASE}/dashboard/book-of-the-month`);

export const updateCurrentBook = (bookData) =>
  axios.post(`${API_BASE}/dashboard/book-of-the-month`, bookData);

export const fetchChartData = () => axios.get(`${API_BASE}/dashboard/charts`);
