// models/otp.model.js
import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  otpHash: {
    type: String,
    required: true,
  },
  attempts: {
    type: Number,
    default: 0, // Track wrong guesses
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // Document automatically self-destructs after 10 minutes (600s)!
  },
});

export const OTP = mongoose.model("OTP", otpSchema);
