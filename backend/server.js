const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://moonsupreme1927:<moonsupreme1927>@responseparameters.lychz.mongodb.net/?retryWrites=true&w=majority&appName=ResponseParameters', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

let data = [];
try {
  const file = fs.readFileSync('users.json', 'utf-8');
  const parsed = JSON.parse(file);
  data = parsed.users || [];
} catch (err) {
  console.error('Error reading users.json:', err);
}

app.get('/search', (req, res) => {
  const query = (req.query.query || '').toLowerCase();
  const results = data.filter(user =>
    user.name.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query) ||
    user.phone.includes(query)
  );
  res.json(results);
});

app.post('/add', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const newUser = new User({ name, email, phone });
    await newUser.save();
    res.status(201).json({ message: 'User added successfully!' });
  } catch (error) {
    console.error('Add user failed:', error);
    res.status(500).json({ error: 'Failed to add user' });
  }
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
