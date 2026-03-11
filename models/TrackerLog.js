const mongoose = require("mongoose");

const TrackerLogSchema = new mongoose.Schema({
    userId: String,   // Optional but recommended later
    appName: String,
    windowTitle: String,
    duration: Number,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("TrackerLog", TrackerLogSchema);