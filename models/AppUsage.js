// backend/models/AppUsage.js
const mongoose = require("mongoose");

const appUsageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  appName: { type: String, required: true },
  totalMinutes: { type: Number, required: true },
  activeMinutes: { type: Number, default: 0 },
  idleMinutes: { type: Number, default: 0 },
  date: { type: Date, required: true }
});

module.exports = mongoose.model("AppUsage", appUsageSchema);