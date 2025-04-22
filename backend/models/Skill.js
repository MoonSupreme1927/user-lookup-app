const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skills: [String]
});

module.exports = mongoose.model('Skill', SkillSchema);
// This model defines the structure of the Skill collection in MongoDB.
// The userId field references the User model, establishing a relationship between users and their skills.
