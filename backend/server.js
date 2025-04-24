// 📦 Dependencies
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const auth = require('./middleware/auth');
const jwt = require('jsonwebtoken');

// 🛠️ Models
const User = require('./models/User');
const Skill = require('./models/Skill');

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

// 📝 Signup Route - hash password and store user
app.post('/signup', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, phone, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'Signup successful!' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 🔐 Login Route - verify password
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid password' });

    // ✅ Generate token
    const token = jwt.sign(
      { _id: user._id, email: user.email, role: user.role || 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // ✅ Send token with user data
    res.status(200).json({ message: 'Login successful', user, token });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/dashboard', auth.verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password'); // don't send hashed password
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

// ➕ Add New User (unauthenticated)
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
      console.log('🆕 Creating new skill doc for:', userId);
    } else {
      if (skillDoc.skills.includes(skill)) {
        console.log('⚠️ Skill already exists:', skill);
        return res.status(409).json({ error: 'Skill already exists' });
      }
      skillDoc.skills.push(skill);
      console.log('➕ Adding skill:', skill);
    }

    await skillDoc.save();
    res.status(200).json(skillDoc);
  } catch (err) {
    console.error('❌ Error adding skill:', err);
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
