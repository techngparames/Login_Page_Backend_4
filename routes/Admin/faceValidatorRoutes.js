const express = require("express");
const router = express.Router();
const Admin = require("../../models/Admin"); // Admin model
const { euclideanDistance } = require("../../utils/faceUtils"); // helper to compare face

// POST /api/admin/face-validate
router.post("/face-validate", async (req, res) => {
  try {
    const { adminId, adminEmail, faceDescriptor } = req.body;

    if (!adminId || !adminEmail || !faceDescriptor)
      return res.status(400).json({ success: false, message: "All fields required" });

    // Find admin in the new collection
    const admin = await Admin.findOne({ employeeId: adminId, email: adminEmail });
    if (!admin)
      return res.status(404).json({ success: false, message: "Admin not found" });

    const storedDescriptor = admin.faceDescriptor;
    const distance = euclideanDistance(storedDescriptor, faceDescriptor);

    if (distance < 0.6) {
      return res.json({ success: true, message: "Face matched ✅", admin });
    } else {
      return res.status(401).json({ success: false, message: "Face does not match ❌" });
    }
  } catch (error) {
    console.error("Face Validate Error:", error);
    res.status(500).json({ success: false, message: "Server error ❌" });
  }
});

module.exports = router;