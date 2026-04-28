// models/Otp.js
const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false }
}, { timestamps: true });

// Optional TTL index to auto-delete expired OTPs (if your Mongo supports TTL)
otpSchema.index({ "expiresAt": 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Otp', otpSchema);
