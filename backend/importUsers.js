const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

// Define your user schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  password: String, // optional
});

const User = mongoose.model('User', userSchema);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.once('open', async () => {
  console.log('✅ Connected to MongoDB');

  // Read users.json file
  const rawData = fs.readFileSync('./users.json', 'utf8');
  const jsonData = JSON.parse(rawData);

  // Optional: Clear the collection first
  await User.deleteMany({});

  // Insert each user individually
  const inserted = await User.insertMany(jsonData.users);

  console.log(`✅ Inserted ${inserted.length} users successfully!`);

  mongoose.connection.close();
});
