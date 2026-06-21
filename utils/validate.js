function isNonEmpty(str) {
  return typeof str === 'string' && str.trim().length > 0;
}

function isEmail(str) {
  return typeof str === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

function isLengthBetween(str, min, max) {
  return typeof str === 'string' && str.trim().length >= min && str.trim().length <= max;
}

module.exports = { isNonEmpty, isEmail, isLengthBetween };
