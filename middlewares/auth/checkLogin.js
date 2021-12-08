const User = require("../../models/people");
const Org = require("../../models/org");
const jwt = require("jsonwebtoken");

module.exports = async function (req, res, next) {
  try {
    const cookies = Object.keys(req.signedCookies).length > 0 ? req.signedCookies : null;

    if (cookies) {
      const token = cookies[process.env.COOKIE_NAME];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findOne({ _id: decoded._id }).lean({ defaults: true });
      const org = await Org.findOne({ _id: decoded._id }).lean({ defaults: true });

      if (org) {
        req.org = org;
        next();
      } else {
        if (!user) {
          res.status(401).json({ msg: "You are not logged in" });
        } else {
          req.user = user;
          next();
        }
      }
    } else {
      res.status(401).json({ msg: "You are not logged in" });
    }
  } catch (err) {
    res.status(401).json({
      msg: "You are not logged in",
      error: err.message || err || "Authentication failure",
    });
  }
};
