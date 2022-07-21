module.exports = function (expiresAt = null) {
  return new Date().valueOf() >= new Date(expiresAt).valueOf();
};
