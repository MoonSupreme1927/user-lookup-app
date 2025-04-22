const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

const User = require('./models/User');
const Skill = require('./models/Skill');

const users = require('./users.json');
const skills = require('./skills.json');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('✅ Connected to MongoDB');

  // Optional: clear existing data first
  await User.deleteMany({});
  await Skill.deleteMany({});

  // Insert users
  const insertedUsers = await User.insertMany(users);
  console.log(`✅ Inserted ${insertedUsers.length} users`);

  // Map skill entries to real Mongo ObjectIds
  const userIdMap = {};
  insertedUsers.forEach(user => {
    userIdMap[user._id.toString()] = user._id;
  });

  const skillDocs = skills.map(skill => ({
    userId: userIdMap[skill.userId] || skill.userId,
    skills: skill.skills
  }));

  await Skill.insertMany(skillDocs);
  console.log(`✅ Inserted ${skillDocs.length} skill entries`);

  mongoose.connection.close();
}).catch(err => {
  console.error('❌ Error inserting data:', err);
});
