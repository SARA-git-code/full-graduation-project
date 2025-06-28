const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  isGroup: {
    type: Boolean,
    default: false
  },
  groupName: {
    type: String,
    default: null
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Conversation', conversationSchema);

