const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
  },
  phoneSuffix: {
    type: String,
    unique: false,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, 
    lowercase: true,
    trim: true, 
    match: [
      /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
      "Please enter a valid email address",
    ], 
  },
  emailOtp: {
    type: String
  },
  emailOtpExpiry: {
    type: Date
  },
  profilePicture: {
    type: String
  },
  about: {
    type: String
  },
  lastSeen: {
    type: Date
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  agreed: {
    type: Boolean,
    default: false
  }
},{
    timestamps: true
});

const User = mongoose.model('User',userSchema);
module.exports = User