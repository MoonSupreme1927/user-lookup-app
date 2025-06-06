const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { verifyToken, requireUser, requireAdmin, requireOwner, } = require('./middleware/auth');
// Load environment variables
require('dotenv').config();

// Import models


const User = require('./models/User');
const Skill = require('./models/Skill');
const Book = require('./models/Book');

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// 🔐 Signup route
app.post('/users/signup', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const lowerEmail = email.toLowerCase();

    const existingUser = await User.findOne({ email: lowerEmail });
    if (existingUser) return res.status(409).json({ error: 'User already exists' });

    const IPQS_API_KEY = process.env.IPQS_API_KEY;
    const axios = require('axios');

    // 🔍 Validate email and phone BEFORE saving the user
    const emailCheck = await axios.get(`https://ipqualityscore.com/api/json/email/${IPQS_API_KEY}/${lowerEmail}`);
    const phoneCheck = await axios.get(`https://ipqualityscore.com/api/json/phone/${IPQS_API_KEY}/${phone}`);

    console.log('IPQS Email Check:', emailCheck.data);
    console.log('IPQS Phone Check:', phoneCheck.data);

    if (!emailCheck.data.valid || emailCheck.data.disposable) {
      return res.status(400).json({ error: 'Invalid or disposable email.' });
    }

    if (!phoneCheck.data.valid || phoneCheck.data.active !== true) {
      return res.status(400).json({ error: 'Invalid or inactive phone number.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email: lowerEmail, phone, password: hashedPassword });
    await newUser.save();

    // ✅ SKILLS ROUTES

// Get skills by user ID
app.get('/skills/:userId', async (req, res) => {
  try {
    const skillDoc = await Skill.findOne({ userId: req.params.userId });
    if (!skillDoc) return res.json({ skills: [] });
    res.json({ skills: skillDoc.skills });
  } catch (err) {
    console.error('Error fetching skills:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add a skill for a user
app.post('/skills/:userId', verifyToken, requireOwner, async (req, res) => {
  const { skill } = req.body;
  const { userId } = req.params;

  if (!skill) return res.status(400).json({ error: 'Skill is required' });

  try {
    let skillDoc = await Skill.findOne({ userId });

    if (!skillDoc) {
      skillDoc = new Skill({ userId, skills: [skill] });
    } else if (!skillDoc.skills.includes(skill)) {
      skillDoc.skills.push(skill);
    } else {
      return res.status(409).json({ error: 'Skill already exists' });
    }

    await skillDoc.save();
    res.json({ skills: skillDoc.skills });
  } catch (err) {
    console.error('Error adding skill:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a skill
app.delete('/skills/:userId/:skill', verifyToken, requireOwner, async (req, res) => {
  try {
    const skillDoc = await Skill.findOne({ userId: req.params.userId });
    if (!skillDoc) return res.status(404).json({ error: 'No skills found' });

    skillDoc.skills = skillDoc.skills.filter(s => s !== req.params.skill);
    await skillDoc.save();

    res.json({ skills: skillDoc.skills });
  } catch (err) {
    console.error('Error deleting skill:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


    res.status(201).json({ message: 'Signup successful!' });
  } catch (err) {
    console.error('Signup error:', err.response?.data || err);
    res.status(500).json({ error: 'Server error during signup' });
  }
});


// 🔐 Login route
app.post('/users/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid password' });

    const token = jwt.sign(
      { _id: user._id.toString(), email: user.email, role: user.role || 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({ message: 'Login successful', user, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});
app.get('/dashboard', verifyToken, requireUser, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});


// 🧾 Public Routes
app.get('/search', async (req, res) => {
  const { query } = req.query;
  if (!query) return res.json([]);
  try {
    const results = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { phone: { $regex: query } },
      ],
    });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Search error' });
  }
});

app.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/users/:id', verifyToken, requireOwner, async (req, res) => {
  const { id } = req.params;
  const { name, email, phone } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email: email.toLowerCase(), phone },
      { new: true }
    ).select('-password');

    if (!updatedUser) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'Profile updated', user: updatedUser });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


app.get('/skills/:userId', async (req, res) => {
  try {
    const skills = await Skill.findOne({ userId: req.params.userId });
    if (!skills) return res.json({ skills: [] });
    res.json(skills);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});
app.post('/vote/:bookId', verifyToken, async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.bookId,
      { $inc: { votes: 1 } },
      { new: true }
    );

    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json({ message: 'Vote recorded!', book });
  } catch (err) {
    console.error('Vote error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


app.get('/books', verifyToken, async (req, res) => {
  try {
    const books = await Book.find(); // optionally add sorting or filters
    res.json(books);
  } catch (err) {
    console.error('Book fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});


// ➕ Add skill (protected)
app.post('/skills/:userId', verifyToken, requireOwner, async (req, res) => {
  const { skill } = req.body;
  const { userId } = req.params;
  if (!skill) return res.status(400).json({ error: 'Skill is required' });

  try {
    let skillDoc = await Skill.findOne({ userId });
    if (!skillDoc) {
      skillDoc = new Skill({ userId, skills: [skill] });
    } else if (!skillDoc.skills.includes(skill)) {
      skillDoc.skills.push(skill);
    } else {
      return res.status(409).json({ error: 'Skill already exists' });
    }

    await skillDoc.save();
    res.json(skillDoc);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ❌ Delete skill (protected)
app.delete('/skills/:userId/:skill', verifyToken, requireOwner, async (req, res) => {
  try {
    const skillDoc = await Skill.findOne({ userId: req.params.userId });
    if (!skillDoc) return res.status(404).json({ error: 'No skills found' });

    skillDoc.skills = skillDoc.skills.filter(s => s !== req.params.skill);
    await skillDoc.save();

    res.json(skillDoc);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
