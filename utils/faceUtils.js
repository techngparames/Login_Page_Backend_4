// backend/utils/faceUtils.js

function euclideanDistance(descriptor1, descriptor2) {
  if (descriptor1.length !== descriptor2.length) return Infinity;

  let sum = 0;
  for (let i = 0; i < descriptor1.length; i++) {
    const diff = descriptor1[i] - descriptor2[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

module.exports = { euclideanDistance };