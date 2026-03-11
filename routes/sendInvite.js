const express = require("express");
const router = express.Router();
const sendInviteMail = require("../services/mailService");

router.post("/send-invite", async (req, res) => {
  const { email } = req.body;

  try {
    await sendInviteMail(email);

    res.status(200).json({
      message: "Invite sent successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to send email",
      error: error.message
    });
  }
});

module.exports = router;