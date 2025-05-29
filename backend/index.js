// backend/index.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const userRoutes = require('./routes/users');

const app = express();

// Trust proxy for secure cookies (important on Render)
app.set('trust proxy', 1);

// Middleware
app.use(express.json());

// CORS - allow frontend to send cookies
app.use(cors({
  origin: 'https://user-lookup-app-frontend.onrender.com', // frontend URL
  credentials: true, // allow cookies
}));

// Session
app.use(session({
  name: 'user.sid',
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI || 'your-mongodb-uri',
    collectionName: 'sessions'
  }),
  cookie: {
    httpOnly: true,
    secure: true,         // Only send cookies over HTTPS
    sameSite: 'none',     // Allow cookies from different origin
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

// Routes
app.use('/api/users', userRoutes);

// Connect to DB and start server
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI || 'your-mongodb-uri')
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));
