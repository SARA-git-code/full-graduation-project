const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'User name is required'],
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },

  isVerified: {
  type: Boolean,
  default: false,
},
verificationCode: {
  type: String,
},

  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  profileImage: {
    type: String,
    default: ''
  },
  backgroundImage: {
    type: String,
    default: ''
  },
  description: {
  type: String,
  trim: true,
  default: "Helping others is my passion.",
},
  location: {
    type: String,
    trim: true,
    default: ''
  },

 showPhone: { type: Boolean, default: true },

  phone: {
    type: String,
    trim: true,
    default: ''
  },
  savedDonations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation'
  }],
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  language: {
  type: String,
  default: 'en',
},
theme: {
  type: String,
  default: 'light',
},
isBanned: {
  type: Boolean,
  default: false,
},

  resetCode: String,
resetCodeExpires: Date,


}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
