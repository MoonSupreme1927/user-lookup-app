// 📦 Dependencies
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// 🛠️ Models
const User = require('./models/User');
const Skill = require('./models/Skill');

// 🔐 Middleware
const {
  verifyToken,
  requireUser,
  requireAdmin,
  requireOwner,
  router: authRoutes
} = require('./routes/auth'); // Auth routes + middlewares in one file

// 🚀 App Setup
const app = express();
app.use(cors());
app.use(express.json());

// 🌐 Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// 🔑 Auth Routes (signup, login)
app.use('/', authRoutes);

// 🧠 Dashboard (protected route)
app.get('/dashboard', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.status(200).json({
      message: `Welcome to your dashboard, ${user.name}`,
      user
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 🔍 Search Users
app.get('/search', async (req, res) => {
  const { query } = req.query;
  if (!query) return res.json([]);
  try {
    const results = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { phone: { $regex: query } }
      ]
    });
    res.json(results);
  } catch (err) {
    console.error('Search failed:', err);
    res.status(500).json({ error: 'Search error' });
  }
});

// ➕ Add User (unauthenticated)
app.post('/add', async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ error: 'User already exists' });

    const newUser = new User({ name, email, phone });
    await newUser.save();
    res.status(201).json({ message: 'User added successfully!' });
  } catch (err) {
    console.error('Add user failed:', err);
    res.status(500).json({ error: 'Failed to add user' });
  }
});

// 📄 Get User by ID
app.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 📚 Get Skills for a User
app.get('/skills/:userId', async (req, res) => {
  try {
    const skills = await Skill.findOne({ userId: req.params.userId });
    if (!skills) return res.json({ skills: [] });
    res.json(skills);
  } catch (err) {
    console.error('Error fetching skills:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ➕ Add a Skill to a User
app.post('/skills/:userId', async (req, res) => {
  const { skill } = req.body;
  const userId = req.params.userId;

  if (!skill || !userId) {
    return res.status(400).json({ error: 'Missing skill or userId' });
  }

  try {
    let skillDoc = await Skill.findOne({ userId });

    if (!skillDoc) {
      skillDoc = new Skill({ userId, skills: [skill] });
    } else {
      if (skillDoc.skills.includes(skill)) {
        return res.status(409).json({ error: 'Skill already exists' });
      }
      skillDoc.skills.push(skill);
    }

    await skillDoc.save();
    res.status(200).json(skillDoc);
  } catch (err) {
    console.error('Error adding skill:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ❌ Remove Skill from User
app.delete('/skills/:userId/:skill', async (req, res) => {
  try {
    const skillDoc = await Skill.findOne({ userId: req.params.userId });
    if (!skillDoc) return res.status(404).json({ error: 'No skills found' });

    skillDoc.skills = skillDoc.skills.filter(s => s !== req.params.skill);
    await skillDoc.save();

    res.json(skillDoc);
  } catch (err) {
    console.error('Error removing skill:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 🟢 Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
