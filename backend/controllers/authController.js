const User = require('../models/User');
const Skill = require('../models/Skill');

exports.signupUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Prevent duplicate accounts
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const newUser = new User({ name, email, phone, password });
    await newUser.save();

    // Create an empty skill profile for this user
    await new Skill({ userId: newUser._id, skills: [] }).save();

    res.status(201).json({ message: 'Signup successful', user: newUser });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error during signup' });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.status(200).json({ message: 'Login successful', user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
};
