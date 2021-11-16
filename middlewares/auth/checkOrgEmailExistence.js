const Org = require("../../models/org");

module.exports = async function (req, res, next) {
  try {
    const { email } = req.body;

    const orgExists = await Org.findOne({ email });

    if (orgExists) {
      res.status(400).json({ msg: "Email already Exists" });
    } else {
      next();
    }
  } catch (err) {
    next(err);
  }
};
