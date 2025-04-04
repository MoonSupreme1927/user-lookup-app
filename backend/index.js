const express = require('express');
const fs = require('fs');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(users.json());

const data = JSON.parse(fs.readFileSync('users.json', 'utf-8')).users;

app.get('/search', (req, res) => {
  const { query } = req.query;
  const results = Object.values(data).filter(user =>
    user.name.toLowerCase().includes(query.toLowerCase()) ||
    user.email.toLowerCase().includes(query.toLowerCase()) ||
    user.phone.includes(query)
  );
  res.json(results);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
