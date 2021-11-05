const User = require("../models/people");
const Org = require("../models/org");
const Category = require("../models/category");

const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

module.exports = {
  login: async function (req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).populate("courses");

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
      const { firstName, lastName, email, password, referer } = req.body;

      let newUser;

      // if the user is referred
      if (referer && mongoose.isValidObjectId(referer)) {
        newUser = new User({ firstName, lastName, email, password, referer });
      } else {
        newUser = new User({ firstName, lastName, email, password });
      }

      // give the user 10 free questions
      const course = (await Category.find({}))[0];
      const questions = course.questions;

      const freeQuestions = [];

      for (let i = 0; i < 10; i++) {
        freeQuestions.push(questions[i]);
      }

      // updating the referer
      mongoose.isValidObjectId(referer) &&
        (await Org.updateOne({ _id: referer }, { $push: { refers: newUser._id } }));

      await newUser.save();

      // now updating the user with the questions and courses
      await User.updateOne({ _id: newUser._id }, { $push: { questions: freeQuestions } });
      await User.updateOne({ _id: newUser._id }, { $push: { courses: course } });

      const authToken = await newUser.generateToken();

      res.cookie(process.env.COOKIE_NAME, authToken, {
        maxAge: process.env.COOKIE_MAX_AGE,
        httpOnly: true,
        signed: true,
      });

      const userCreated = await User.findOne({ _id: newUser._id }).populate("courses");

      res.status(201).json({ msg: "Your account has been created", user: userCreated });
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

      const newOrg = new Org({
        name: orgName,
        streetAddress,
        postalCode,
        province,
        phone,
        type,
        employeeName: orgEmployeeName,
        employeePosition: orgEmployeePosition,
      });

      const affiliateLink = `${process.env.APP_URL}/auth/register?refererId=${newOrg._id}`;

      await newOrg.save();

      await Org.updateOne({ _id: newOrg._id }, { affiliateLink });

      res.status(201).json({
        msg: "You are a organization now. Go to your dashboard to get your aff link",
        affiliateLink,
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
