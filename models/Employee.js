const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema({
  empId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  faceDescriptor: { type: [Number], required: true }, // face descriptor array
});

module.exports = mongoose.model("Employee", EmployeeSchema);