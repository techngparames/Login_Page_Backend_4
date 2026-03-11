const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema(
{
  // Link to employee (Admin collection)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true
  },

  employeeId: {
    type: String,
    required: true
  },

  name: {
    type: String,
    required: true
  },

  date: {
    type: Date,
    required: true
  },

  loginTime: {
    type: Date
  },

  logoutTime: {
    type: Date
  },

  totalHours: {
    type: String
  },

  status: {
    type: String,
    default: "Present"
  },

  location: {
    placeName: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  }

},
{ timestamps: true }
);

module.exports = mongoose.model("Attendance", AttendanceSchema);