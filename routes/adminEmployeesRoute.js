const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee"); // Correct relative path

// ================= GET Onboarded Employees =================
router.get("/onboarded-employees", async (req, res) => {
  try {
    const employees = await Employee.find({}, { _id: 0, empId: 1, name: 1, faceDescriptor: 1 });
    res.status(200).json({ employees });
  } catch (err) {
    console.error("Error fetching employees:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ================= REGISTER EMPLOYEE FACE =================
router.post("/register-employee", async (req, res) => {
  try {
    const { name, email, empId, faceDescriptor } = req.body;

    if (!name || !email || !empId || !faceDescriptor) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existing = await Employee.findOne({ $or: [{ email }, { empId }] });
    if (existing) {
      return res.status(400).json({ message: "Employee already exists" });
    }

    const newEmployee = new Employee({ name, email, empId, faceDescriptor });
    await newEmployee.save();

    res.status(201).json({ success: true, message: "Employee registered ✅", employee: newEmployee });
  } catch (err) {
    console.error("Error registering employee:", err);
    res.status(500).json({ message: "Registration failed ❌" });
  }
});

module.exports = router;