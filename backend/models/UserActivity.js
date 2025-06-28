const mongoose = require('mongoose');

const UserActivitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  kind: {
    type: String,
    required: true,
    enum: ['clothes', 'electronics', 'furniture', 'food', 'nursing', 'other']
  },
  location: {
    type: String,
    required: true
  },
  action: {
    type: String,
    enum: ['view', 'save', 'contact'],
    default: 'view'
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('UserActivity', UserActivitySchema);
