const express = require("express");

const { login, register } = require("../controllers/authController");

const checkEmailExistence = require("../middlewares/auth/checkEmailExistence");

const router = express.Router();

// for registering a user
router.post("/register", checkEmailExistence, register);

// for logging in a user
router.post("/login", login);

module.exports = router;
