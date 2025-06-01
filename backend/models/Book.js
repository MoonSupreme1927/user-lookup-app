const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  publishedYear: Number, // optional for Book of the Month
  genre: String, // optional for Book of the Month
  votes: { type: Number, default: 0} // optional for Book of the Month
});

module.exports = mongoose.model('Book', bookSchema);
// This model defines the structure of the Book collection in MongoDB.
// The title and author fields are strings, and votes is a number that can be used for voting functionality.