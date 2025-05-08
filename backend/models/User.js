const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },

  phone: {
    type: String,
    required: false
  },

  password: {
    type: String,
    required: true
  },

  // ✅ Email verification
  isVerified: {
    type: Boolean,
    default: false
  },

  // ✅ Reset password fields
  resetToken: String,
  resetTokenExpiry: Date,

  // Optional: user role
  role: {
    type: String,
    default: 'user',
    enum: ['user', 'admin']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
