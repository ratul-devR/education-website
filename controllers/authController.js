const User = require("../models/people");
const Org = require("../models/org");
const Category = require("../models/category");

const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

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

      // give the user 10 free questions from any random category [0] 'firstOne'
      const courses = await Category.find({});
      const course = courses && courses.length > 0 ? courses[0] : null;

      if (course) {
        const questions = course ? course.questions : [];

        const freeQuestions = [];

        for (let i = 0; i < 10; i++) {
          freeQuestions.push(questions[i]);
        }

        freeQuestions.filter((freeQuestion) => freeQuestion !== null);

        // now updating the user with the questions and courses
        await User.updateOne({ _id: newUser._id }, { $push: { courses: course } });
        if (freeQuestions.length > 0) {
          await User.updateOne({ _id: newUser._id }, { $push: { questions: freeQuestions } });
        }
      }

      // updating the referer
      mongoose.isValidObjectId(referer) &&
        (await Org.updateOne({ _id: referer }, { $push: { refers: newUser._id } }));

      await newUser.save();

      const authToken = await newUser.generateToken();

      res.cookie(process.env.COOKIE_NAME, authToken, {
        maxAge: process.env.COOKIE_MAX_AGE,
        httpOnly: true,
        signed: true,
      });

      // send a confirmation email to the user
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASS,
        },
      });
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
        msg: "We sent you an email for confirmation",
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
        streetAddress,
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
        streetAddress,
        city,
        postalCode,
        province,
        phone,
        type,
        employeeName: orgEmployeeName,
        employeePosition: orgEmployeePosition,
        subscribed: subscribe,
      });

      const affiliateLink = `${process.env.APP_URL}/auth/register?refererId=${newOrg._id}`;

      await newOrg.save();

      await Org.updateOne({ _id: newOrg._id }, { affiliateLink });

      res.status(201).json({ affiliateLink });
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
