const faceapi = require("face-api.js");

/**
 * Compare face descriptors
 * Returns true if faces match
 */

const matchFaceDescriptor = (inputDescriptor, storedDescriptor) => {
  try {
    const distance = faceapi.euclideanDistance(
      inputDescriptor,
      storedDescriptor
    );

    return distance < 0.6; // Matching threshold
  } catch (error) {
    console.error("Face Matching Error:", error);
    return false;
  }
};

module.exports = { matchFaceDescriptor };