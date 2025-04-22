const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

const User = require('./models/User'); // adjust path if needed

// 🔧 Random skill pool
const SKILLS = [
  'JavaScript', 'React', 'Node.js', 'MongoDB',
  'Python', 'Flask', 'Pandas',
  'Java', 'Spring Boot', 'Hibernate',
  'C#', '.NET', 'SQL Server',
  'Ruby', 'Rails', 'PostgreSQL'
];

const getRandomSkills = () => {
  const count = Math.floor(Math.random() * 3) + 2; // 2 to 4 skills
  const shuffled = SKILLS.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('✅ Connected to MongoDB');

  const users = await User.find({}, '_id name email phone password');

  // 👉 Save users to users.json
  const userExport = users.map(user => ({
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    password: user.password
  }));

  fs.writeFileSync('./users.json', JSON.stringify(userExport, null, 2));
  console.log('✅ users.json created');

  // 👉 Generate skills for each user
  const skillExport = users.map(user => ({
    userId: user._id.toString(),
    skills: getRandomSkills()
  }));

  fs.writeFileSync('./skills.json', JSON.stringify(skillExport, null, 2));
  console.log('✅ skills.json created');

  mongoose.connection.close();
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
});
