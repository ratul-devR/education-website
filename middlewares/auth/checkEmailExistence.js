const User = require("../../models/people");

module.exports = async function (req, res, next) {
  try {
    const email = req.body.email;

    const emailExists = (await User.findOne({ email })) || null;

    if (emailExists) {
      res.status(400).json({ msg: "Email already exists" });
    } else {
      next();
    }
  } catch (err) {
    res.status(500).json({ msg: err.message || err });
  }
};
