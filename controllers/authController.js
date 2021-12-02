const User = require("../models/people");
const Org = require("../models/org");
const Category = require("../models/category");
const Question = require("../models/question");

const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const transporter = require("../utils/emailTransporter");

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

      // updating the referer
      mongoose.isValidObjectId(referer) &&
        (await Org.updateOne({ _id: referer }, { $push: { refers: newUser._id } }));

      await newUser.save();

      const courses = await Category.find({});
      const questions = await Question.find({});

      if (courses.length > 0) {
        // now updating the user with the questions and courses
        await User.updateOne({ _id: newUser._id }, { $push: { courses } });
        await User.updateOne({ _id: newUser._id }, { $push: { questions } });
      }

      const authToken = await newUser.generateToken();

      res.cookie(process.env.COOKIE_NAME, authToken, {
        maxAge: process.env.COOKIE_MAX_AGE,
        httpOnly: true,
        signed: true,
      });

      // send a confirmation email to the user
      const domain = req.protocol + "://" + req.get("host");
      await transporter.sendMail({
        from: `${process.env.EMAIL}`,
        to: newUser.email,
        subject: "Confirm Your Email address",
        html: `
          <h2>Thanks for Registering</h2>
          <p>In order to continue, you need to confirm your email address</p>
          <a href="${domain + `/get_auth/confirmEmail/${newUser._id}`}">Confirm Email</a>
        `,
      });

      const userCreated = await User.findOne({ _id: newUser._id }).populate("courses");

      res.status(201).json({
        msg: "We have sent you an email for confirmation",
        title: "Attention",
        user: userCreated,
      });
    } catch (err) {
      next(err);
    }
  },

  confirmEmail: async function (req, res, next) {
    try {
      const { accountId } = req.params;

      if (mongoose.isValidObjectId(accountId)) {
        const user = await User.findOneAndUpdate({ _id: accountId }, { verified: true });
        if (!user) {
          res.status(404).json({ msg: "User not found" });
        }
        if (user.role == "admin") {
          res.redirect(`${process.env.APP_URL}/admin`);
        } else {
          res.redirect(`${process.env.APP_URL}/dashboard`);
        }
      } else {
        res.status(400).json({ msg: "failed. client error" });
      }
    } catch (err) {
      next(err);
    }
  },

  registerOrg: async function (req, res, next) {
    try {
      const {
        orgName,
        email,
        password,
        streetAddress,
        colleagues,
        city,
        postalCode,
        province,
        phone,
        type,
        orgEmployeeName,
        orgEmployeePosition,
        subscribe,
      } = req.body;

      const newOrg = new Org({
        name: orgName,
        email,
        password,
        streetAddress,
        city,
        postalCode,
        province,
        phone,
        type,
        peoples: colleagues,
        employeeName: orgEmployeeName,
        employeePosition: orgEmployeePosition,
        subscribed: subscribe,
      });

      await newOrg.save();

      const affiliateLink = `${process.env.APP_URL}/auth/register?refererId=${newOrg._id}`;
      await Org.updateOne({ _id: newOrg._id }, { affiliateLink });

      await transporter.sendMail({
        from: `${process.env.EMAIL}`,
        to: newOrg.email,
        subject: "Here is your affiliate Link",
        html: `
          <h2>Thanks for registering for our affiliate program</h2>
          <p>You can use this link to refer students</p>
          <a href="${affiliateLink}">${affiliateLink}</a>
        `,
      });

      res.status(201).json({ affiliateLink, msg: "We just emailed you the affiliate Link" });
    } catch (err) {
      next(err);
    }
  },

  loginOrg: async function (req, res, next) {
    try {
      const { email, password } = req.body;

      const org = await Org.findOne({ email });

      if (!org) {
        res.status(400).json({ msg: "Invalid Credentials" });
      }

      const passwordMatched = await bcrypt.compare(password, org.password);

      if (!passwordMatched) {
        res.status(400).json({ msg: "Invalid Credentials" });
      }

      const token = await org.generateToken();

      res.cookie(process.env.COOKIE_NAME, token, {
        maxAge: process.env.COOKIE_MAX_AGE,
        httpOnly: true,
        signed: true,
      });

      res.status(200).json({ msg: "Login Successfull", org });
    } catch (err) {
      next(err);
    }
  },

  sendResponseIfLoggedIn: function (req, res) {
    res.status(201).send(req.user || req.org);
  },

  logout: function (req, res) {
    res.clearCookie(process.env.COOKIE_NAME);
    res.status(201).json({ msg: "Logged out" });
  },
};
