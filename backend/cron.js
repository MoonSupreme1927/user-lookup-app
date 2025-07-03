// cron.js
const cron = require('node-cron');
const axios = require('axios');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
require('dotenv').config();

const User = require('./models/User');
const MonthlyBook = require('./models/MonthlyBook');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// 🔔 Weekly Monday 8AM Notification
cron.schedule('0 8 * * 1', async () => {
  try {
    const book = await MonthlyBook.findOne().sort({ startDate: -1 });
    if (!book || book.currentWeek >= book.chapters.length) return;

    book.currentWeek += 1;
    await book.save();

    const users = await User.find();
    const emails = users.map(u => u.email);
    const currentChapters = book.chapters[book.currentWeek - 1];

    // 📧 Send email reminder
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
      text: `This week's reading is: ${currentChapters}\nJoin us Thursday at 8PM CST.`
    });

    // 📲 Send OneSignal push
    await axios.post('https://onesignal.com/api/v1/notifications', {
      app_id: process.env.ONESIGNAL_APP_ID,
      included_segments: ['All'],
      headings: { en: `📚 Week ${book.currentWeek}: ${book.title}` },
      contents: { en: `This week’s chapters: ${currentChapters}` }
    }, {
      headers: {
        Authorization: `Basic ${process.env.ONESIGNAL_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`✅ Week ${book.currentWeek} notifications sent.`);
  } catch (err) {
    console.error('❌ Cron job error:', err);
  }
});
