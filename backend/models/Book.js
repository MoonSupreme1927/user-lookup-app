const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  publishedYear: Number,
  genre: {
    type: String,
    enum: ['Fiction', 'Non-Fiction', 'Fantasy', 'Mystery', 'Biography', 'History', 'Science Fiction', 'Romance', 'Other'],
    required: true
  },
  votes: { type: Number, default: 0 },
  readCount: { type: Number, default: 0 } // new field to track how many times a book was read
});

module.exports = mongoose.model('Book', bookSchema);
