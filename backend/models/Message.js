const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  content: {
    type: String,
    maxlength: 1000
  },
  isSeen: {
    type: Boolean,
    default: false
  },
  attachment: {
    type: String
  },
  location: {
    lat: Number,
    lng: Number
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'audio', 'video', 'location'],
    default: 'text'
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'seen'],
    default: 'sent'
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  deleted: { type: Boolean, default: false }, 
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
