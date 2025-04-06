const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Load user data as an array
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));


