// controllers/authController.js

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const nodemailer = require('nodemailer');

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: 'No user found with that email' });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const resetLink = `https://yourdomain.com/reset-password/${token}`;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const emailContent = `
    <html>
      <body style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; background: white; padding: 30px; margin: auto; border-radius: 8px;">
          <h2>Password Reset Request</h2>
          <p>You requested to reset your password. Click the button below to continue:</p>
          <a href="${resetLink}" style="display:inline-block;background:#007BFF;color:#fff;padding:12px 20px;border-radius:5px;text-decoration:none;">Reset Password</a>
          <p>If you didn't request this, you can ignore this email.</p>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset',
      html: emailContent
    });

    res.status(200).json({ message: 'Reset link sent to your email.' });
  } catch (err) {
    console.error('Email error:', err);
    res.status(500).json({ error: 'Email could not be sent' });
  }
};

exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset error:', err);
    res.status(400).json({ error: 'Invalid or expired token' });
  }
};
