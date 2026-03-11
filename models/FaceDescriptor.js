// FaceDescriptor.js
// Purpose: Save unique face descriptors from face-api.js for authenticationconst mongoose = require("mongoose");

const faceDescriptorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    descriptor: {
      type: [Number], // face-api descriptor array
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FaceDescriptor", faceDescriptorSchema);