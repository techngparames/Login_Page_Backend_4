const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

/* Important — Ensure controller function exists */

router.post("/login", authController.login);

module.exports = router;