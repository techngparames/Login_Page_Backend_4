const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true
  },

  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  faceDescriptor: {
    type: [Number],
    required: true
  },

  location: {
    type: Object
  },

  loginCount: {
    type: Number,
    default: 0
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Export with collection name "admins"
module.exports = mongoose.model("Admin", AdminSchema, "admins");