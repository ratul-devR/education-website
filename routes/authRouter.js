const express = require("express");

// controllers
const {
  login,
  register,
  sendResponseIfLoggedIn,
  logout,
  registerOrg,
  confirmEmail,
  loginOrg,
  getRefererInfo,
  resetPasswordSendEmail,
  resetPass
} = require("../controllers/authController");

const checkEmailExistence = require("../middlewares/auth/checkEmailExistence");
const checkOrgEmailExistence = require("../middlewares/auth/checkOrgEmailExistence");
const checkLogin = require("../middlewares/auth/checkLogin");

const router = express.Router();

// for registering a user
router.post("/register", checkEmailExistence, register);

// for logging in a user
router.post("/login", login);

// for registering an org
router.post("/registerOrg", checkOrgEmailExistence, registerOrg);

// for logging in the org's
router.post("/loginOrg", loginOrg)

// for sending email to reset password
router.post("/resetPasswordSendEmail", resetPasswordSendEmail)

// for resetting the password
router.post("/resetPassword/:userId", resetPass)

// for confirming an email address
router.get("/confirmEmail/:accountId", confirmEmail);

// for checking if the user is authenticated or not
router.get("/checkLogin", checkLogin, sendResponseIfLoggedIn);

// for fetching the referer info
router.get("/getRefererInfo/org/:orgId", getRefererInfo)

// for logging out the authenticated user
router.get("/logout", logout);

module.exports = router;
