// backend/models/User.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  employeeId: { type: String, required: true, unique: true },
  faceDescriptor: { type: [Number], required: true },
  loginCount: { type: Number, default: 0 },
  lastLogin: { type: Date },
  loginHistory: [
    {
      loginTime: { type: Date },
      logoutTime: { type: Date },
      pauseTime: { type: Date },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);