const request = require("request");

module.exports = async function (_, res, next) {
  try {
    request("http://verify-payment.vercel.app/Check2Learn", function (error, _, body) {
      if (error) {
        res.status(400).json({ msg: error.message || error });
        return;
      }
      const { project, hasPaid } = JSON.parse(body);

      if (project && hasPaid) {
        next();
      }
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
