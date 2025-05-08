// 📦 Dependencies
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const axios = require('axios');
require('dotenv').config();

// 🧠 Models
const User = require('./models/User');
const Skill = require('./models/Skill');

// 🔐 Middleware
const { verifyToken, requireOwner } = require('./middleware/auth');

// 🌍 Init App
const app = express();
app.use(cors());
app.use(express.json());

// 🔌 MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// 🔐 SIGNUP (IPQS + Email verification)
app.post('/signup', async (req, res) => {
  const { name, email, phone, password } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  try {
    // ✅ IPQualityScore: Email + IP check
    const [emailCheck, ipCheck] = await Promise.all([
      axios.get(`https://ipqualityscore.com/api/json/email/${process.env.IPQS_API_KEY}/${email}`),
      axios.get(`https://ipqualityscore.com/api/json/ip/${process.env.IPQS_API_KEY}/${ip}`)
    ]);

    if (!emailCheck.data.valid || emailCheck.data.spamtrap_score > 0.5) {
      return res.status(400).json({ error: 'Email failed verification.' });
    }

    if (ipCheck.data.fraud_score > 50) {
      return res.status(400).json({ error: 'IP address appears risky.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      isVerified: false
    });
    await newUser.save();
    await new Skill({ userId: newUser._id, skills: [] }).save();

    const emailToken = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${emailToken}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `User Lookup Tool <${process.env.EMAIL_FROM}>`,
      to: newUser.email,
      subject: 'Verify Your Email',
      html: `
        <h2>👋 Welcome to User Lookup Tool!</h2>
        <p>Click below to verify your email:</p>
        <a href="${verifyUrl}">${verifyUrl}</a>
        <p>This link expires in 24 hours.</p>
      `
    });

    res.status(201).json({ message: 'Signup successful! Please check your email to verify.' });

  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// 📧 VERIFY EMAIL
app.get('/verify-email/:token', async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).send('User not found');
    if (user.isVerified) return res.send('Your email is already verified!');
    user.isVerified = true;
    await user.save();
    res.redirect(`${process.env.FRONTEND_URL}/login?verified=true`);
  } catch (err) {
    console.error('Verification error:', err.message);
    res.status(400).send('Invalid or expired verification link.');
  }
});

// 🔐 LOGIN
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!user.isVerified) {
      return res.status(401).json({ error: 'Please verify your email before logging in.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid password' });

    const token = jwt.sign(
      { _id: user._id, email: user.email, role: user.role || 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login successful',
      user: { _id: user._id, name: user.name, email: user.email, role: user.role || 'user' },
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// 🔎 SEARCH USERS
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
    res.status(500).json({ error: 'Search error' });
  }
});

// 👤 GET USER BY ID
app.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 📚 GET USER SKILLS
app.get('/skills/:userId', async (req, res) => {
  try {
    const skills = await Skill.findOne({ userId: req.params.userId });
    res.json(skills || { skills: [] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ➕ ADD SKILL
app.post('/skills/:userId', verifyToken, requireOwner, async (req, res) => {
  const { skill } = req.body;
  try {
    let doc = await Skill.findOne({ userId: req.params.userId });
    if (!doc) doc = new Skill({ userId: req.params.userId, skills: [skill] });
    else if (!doc.skills.includes(skill)) doc.skills.push(skill);
    else return res.status(409).json({ error: 'Skill already exists' });
    await doc.save();
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ❌ DELETE SKILL
app.delete('/skills/:userId/:skill', verifyToken, requireOwner, async (req, res) => {
  try {
    const doc = await Skill.findOne({ userId: req.params.userId });
    if (!doc) return res.status(404).json({ error: 'No skills found' });
    doc.skills = doc.skills.filter(s => s !== req.params.skill);
    await doc.save();
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 🟢 START SERVER
const PORT = process.env.PORT || 3001;
// 🔁 REQUEST PASSWORD RESET
app.post('/reset-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `User Lookup Tool <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject: '🔁 Reset Your Password',
      html: `
        <h2>Password Reset Requested</h2>
        <p>Click below to set a new password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link expires in 15 minutes.</p>
      `
    });

    res.json({ message: 'Reset link sent to your email.' });
  } catch (err) {
    console.error('Reset password request error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 🔒 CONFIRM RESET PASSWORD
app.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user || user.resetToken !== token || Date.now() > user.resetTokenExpiry) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.json({ message: 'Password reset successful!' });
  } catch (err) {
    console.error('Reset confirm error:', err);
    res.status(400).json({ error: 'Reset token is invalid or expired' });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
