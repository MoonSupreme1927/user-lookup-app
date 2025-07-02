// models/MonthlyBook.js
const mongoose = require('mongoose');

const MonthlyBookSchema = new mongoose.Schema({
  title: String,
  author: String,
  coverImage: String,
  audibleLink: String,
  startDate: Date,
  chapters: [String], // array like ['1-3', '4-6', '7-9']
  currentWeek: { type: Number, default: 0 }, // tracks which chapter set is active
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MonthlyBook', MonthlyBookSchema);
// This schema is used to manage the book of the month, including its chapters and current reading week.