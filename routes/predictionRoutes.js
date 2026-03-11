const express = require("express");
const router = express.Router();

const { getRiskPrediction } = require("../controllers/predictionController");

router.get("/:userId", getRiskPrediction);

module.exports = router;