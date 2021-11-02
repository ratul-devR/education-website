const User = require("../models/people");

const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

module.exports = {
  login: async function (req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });

      if (user) {
        const passwordMatched = await bcrypt.compare(password, user.password);

        if (passwordMatched) {
          const authToken = await user.generateToken();

          res.cookie(process.env.COOKIE_NAME, authToken, {
            maxAge: process.env.COOKIE_MAX_AGE,
            httpOnly: true,
            signed: true,
          });

          res.status(201).json({ msg: `Welcome back ${user.lastName}`, user });
        } else {
          res.status(400).json({ msg: "Invalid credentials" });
        }
      } else {
        res.status(400).json({ msg: "Your email doesn't exists" });
      }
    } catch (err) {
      next(err);
    }
  },

  register: async function (req, res, next) {
    try {
      const { firstName, lastName, email, password } = req.body;

      const newUser = new User({ firstName, lastName, email, password });

      await newUser.save();

      const authToken = await newUser.generateToken();

      res.cookie(process.env.COOKIE_NAME, authToken, {
        maxAge: process.env.COOKIE_MAX_AGE,
        httpOnly: true,
        signed: true,
      });

      res.status(201).json({ msg: "Your account has been created", user: newUser });
    } catch (err) {
      next(err);
    }
  },

  registerOrg: async function (req, res, next) {
    try {
      const {
        orgName,
        streetAddress,
        postalCode,
        province,
        phone,
        type,
        orgEmployeeName,
        orgEmployeePosition,
      } = req.body;

      const affiliateLink = `${process.env.APP_URL}/auth/register?refererId=${req.user._id}`;

      const updatedUser = await User.updateOne(
        { _id: req.user._id },
        {
          orgName,
          streetAddress,
          postalCode,
          province,
          phone,
          type,
          orgEmployeeName,
          orgEmployeePosition,
          role: "organization",
          affiliateLink,
        }
      );

      res.status(201).json({
        msg: "You are a organization now. Go to your dashboard to get your aff link",
        user: updatedUser,
      });
    } catch (err) {
      next(err);
    }
  },

  handleAffiliate: async function (req, res, next) {
    try {
      const { refererId } = req.body;

      if (mongoose.isValidObjectId(refererId)) {
        const user = await User.findOne({ _id: refererId });

        if (user) {
          await User.updateOne({ _id: refererId }, { referCount: (user.referCount += 1) });
          res.sendStatus(200);
        } else {
          res.sendStatus(400);
        }
      } else {
        res.sendStatus(400);
      }
    } catch (err) {
      next(err);
    }
  },

  sendResponseIfLoggedIn: function (req, res) {
    res.status(201).send(req.user);
  },

  logout: function (req, res) {
    res.clearCookie(process.env.COOKIE_NAME);
    res.status(201).json({ msg: "Logged out!" });
  },
};
