const express = require("express");
const router = express.Router();
const { sendInviteMail } = require("../services/mailService"); // make sure path is correct

// Test route for Postman
router.post("/test-invite", async (req, res) => {
  const { name, email, empId, faceLoginLink } = req.body;

  try {
    const result = await sendInviteMail({ name, email, empId, faceLoginLink });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to send email", error: error.toString() });
  }
});

module.exports = router;