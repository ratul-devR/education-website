const User = require("../../models/people");
const Org = require("../../models/org");
const jwt = require("jsonwebtoken");

module.exports = async function (req, res, next) {
  try {
    const cookies =
      Object.keys(req.signedCookies).length > 0
        ? req.signedCookies
        : req.headers.authorization && req.headers.authorization.split(" ")[1];

    if (cookies) {
      const token = typeof cookies === "object" ? cookies[process.env.COOKIE_NAME] : cookies;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findOne({ _id: decoded._id })
        .select("-password")
        .lean({ defaults: true });
      const org = await Org.findOne({ _id: decoded._id })
        .lean({ defaults: true })
        .populate("refers");

      // if this id is matching with and org, then send the data of the org cause it has more priority in this app
      // and otherwise just send the user if exists
      if (org) {
        req.org = org;
        req.org.type = "org";
        next();
      } else {
        if (!user) {
          res.status(401).json({ msg: "You are not logged in" });
        } else {
          req.user = user;
          req.user.type = "user";
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
