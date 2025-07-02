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
const MonthlyBook = require('./models/Monthlybook');

const cron = require('node-cron');

// Runs every Monday at 8am
cron.schedule('0 8 * * 1', async () => {
  try {
    const book = await MonthlyBook.findOne().sort({ startDate: -1 });

    if (book && book.currentWeek < book.chapters.length) {
      book.currentWeek += 1;
      book.updatedAt = new Date();
      await book.save();
      console.log(`📘 Book of the Month updated to week ${book.currentWeek}`);
    }
  } catch (err) {
    console.error('Weekly chapter update failed:', err);
  }
});


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

    // Check if user already exists
    const existingUser = await User.findOne({ email: lowerEmail });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const axios = require('axios');
    const IPQS_API_KEY = process.env.IPQS_API_KEY;

    // 🧼 Format phone (assume US if no +)
    let formattedPhone = phone;
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+1' + formattedPhone.replace(/\D/g, '');
    }

    // 🔍 IPQS Email and Phone Validation
    const [emailCheck, phoneCheck] = await Promise.all([
      axios.get(`https://ipqualityscore.com/api/json/email/${IPQS_API_KEY}/${lowerEmail}`),
      axios.get(`https://ipqualityscore.com/api/json/phone/${IPQS_API_KEY}/${formattedPhone}`)
    ]);

    const emailData = emailCheck.data;
    const phoneData = phoneCheck.data;

    console.log('📧 IPQS Email Check:', emailData);
    console.log('📱 IPQS Phone Check:', phoneData);

    // ❌ Reject bad emails
    if (
      emailData.valid !== true ||
      emailData.disposable === true ||
      emailData.fraud_score >= 75 ||
      emailData.recent_abuse === true
    ) {
      return res.status(400).json({ error: 'Email failed fraud or abuse check.' });
    }

    // ❌ Reject bad phones
    if (
      phoneData.valid !== true ||
      phoneData.active !== true ||
      phoneData.fraud_score >= 75 ||
      phoneData.recent_abuse === true
    ) {
      return res.status(400).json({ error: 'Phone number failed fraud or abuse check.' });
    }

    // 🔐 Hash password and save user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email: lowerEmail,
      phone: formattedPhone,
      password: hashedPassword
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// ✅ BOOKS ROUTES

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

app.get('/admin/users', verifyToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});
app.put('/admin/users/:id/promote', verifyToken, requireAdmin, async (req, res) => {
  const { id } = req.params;  
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ error: 'User is already an admin' });
    user.role = 'admin';
    await user.save();
    res.json({ message: 'User promoted to admin', user });
  } catch (err) {
    console.error('Promotion error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete user
app.delete('/admin/users/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error deleting user' });
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


// 📘 GET current book and chapter of the week
app.get('/bookclub/current', async (req, res) => {
  try {
    const book = await MonthlyBook.findOne().sort({ startDate: -1 });
    if (!book) return res.status(404).json({ error: 'No active Book of the Month' });
    res.json({
      title: book.title,
      author: book.author,
      coverImage: book.coverImage,
      audibleLink: book.audibleLink,
      currentWeek: book.currentWeek,
      currentChapters: book.chapters[book.currentWeek - 1] || null
    });
  } catch (err) {
    console.error('Fetch current book error:', err);
    res.status(500).json({ error: 'Failed to fetch Book of the Month' });
  }
});

// 📘 POST new Book of the Month
app.post('/bookclub/new', verifyToken, requireAdmin, async (req, res) => {
  try {
    const newBook = new MonthlyBook({
      ...req.body,
      startDate: new Date(),
      currentWeek: 0,
    });
    await newBook.save();
    res.status(201).json({ message: 'Book of the Month added!' });
  } catch (err) {
    console.error('Add book error:', err);
    res.status(500).json({ error: 'Failed to add Book of the Month' });
  }
});

// ⏰ CRON: Auto-increment week on Mondays 8AM
cron.schedule('0 8 * * 1', async () => {
  try {
    const book = await MonthlyBook.findOne().sort({ startDate: -1 });
    if (book && book.currentWeek < book.chapters.length) {
      book.currentWeek += 1;
      await book.save();
      console.log(`📘 Advanced to week ${book.currentWeek}`);

      // 📬 Send email updates to all users
      const users = await User.find();
      const emails = users.map(u => u.email);

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
        }
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USERNAME,
        to: emails,
        subject: `📚 Book Club Week ${book.currentWeek}: ${book.title}`,
        text: `This week's reading is: ${book.chapters[book.currentWeek - 1]}`
      });
    }
  } catch (err) {
    console.error('Cron job error:', err);
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
