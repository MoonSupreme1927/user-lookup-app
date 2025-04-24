// 📦 Dependencies
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
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

// Forgot Password Route (Send reset link via email)
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ error: 'No user found with that email' });
  }

  // Create a reset token (expires in 1 hour)
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  // Generate the password reset link
  const resetLink = `https://yourdomain.com/reset-password/${token}`;

  // Send the reset email
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,   // Your email (stored in .env)
      pass: process.env.EMAIL_PASS    // Your email password (stored in .env)
    }
  });

  const emailContent = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); }
          .header { text-align: center; margin-bottom: 20px; }
          .header h1 { color: #333333; }
          .content { font-size: 16px; color: #555555; line-height: 1.6; }
          .reset-button { display: inline-block; background-color: #007BFF; color: #ffffff; padding: 12px 25px; text-decoration: none; font-size: 16px; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>We received a request to reset your password. Please click the button below to reset your password:</p>
            <a href="${resetLink}" class="reset-button">Reset Password</a>
            <p>If you did not request a password reset, please ignore this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,    // The email address you're sending from
      to: email,                       // The user's email address
      subject: 'Password Reset Request',
      html: emailContent               // The HTML email content
    });
    
    res.status(200).json({ message: 'Check your email for the reset link' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Error sending reset email' });
  }
});

// Reset Password Route (Update password using the reset token)
app.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    // Verify the reset token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by ID (decoded from token)
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // Save the new password
    await user.save();

    res.status(200).json({ message: 'Password successfully reset' });
  } catch (err) {
    console.error('Error resetting password:', err);
    res.status(500).json({ error: 'Error resetting password' });
  }
});

// Existing Signup Route (hash password and store user)
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
