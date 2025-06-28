const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Donation title is required'],
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: [true, 'Donation description is required'],
    trim: true,
    maxlength: 500
  },
  kind: {
    type: String,
    required: [true, 'Donation kind is required'],
    enum: ['clothes', 'electronics', 'furniture', 'food', 'nursing', 'other'],
    trim: true,
    set: v => v.toLowerCase()
  },
  location: {
    type: String,
    required: [true, 'Donation location is required'],
    trim: true,
    set: v => v.toLowerCase()
  },
  images: {
    type: [String],
    validate: [arr => arr.length >= 1, 'At least 1 images are required'],
    required: true
  },

 expireDate: {
  type: String, // ❗ تم تغييره من Date إلى String حسب طلبك
  required: function () {
    return this.kind === 'food';
  },
  match: [/^\d{4}-\d{2}-\d{2}$/, 'Expire date must be in YYYY-MM-DD format']
},


    condition: {
      type: String,
      enum: ['new', 'used'],
      required: [true, 'Condition (new or used) is required']
    },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },

  isValid: {
  type: Boolean,
  default: true
},
isVisible: {
  type: Boolean,
  default: true,
},

interactions: {
  type: Number,
  default: 0,
}

}, { timestamps: true });

module.exports = mongoose.model('Donation', DonationSchema);

