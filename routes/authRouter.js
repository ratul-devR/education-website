const express = require("express");

const { login, register, sendResponseIfLoggedIn } = require("../controllers/authController");

const checkEmailExistence = require("../middlewares/auth/checkEmailExistence");
const checkLogin = require("../middlewares/auth/checkLogin");

const router = express.Router();

// for registering a user
router.post("/register", checkEmailExistence, register);

// for logging in a user
router.post("/login", login);

// for checking if the user is authenticated or not
router.get("/checkLogin", checkLogin, sendResponseIfLoggedIn);

module.exports = router;
