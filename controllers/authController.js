const User = require("../models/people");
const Org = require("../models/org");

const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const transporter = require("../utils/emailTransporter");

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
      const { firstName, lastName, email, password, referer } = req.body;

      let newUser;

      const hasReferred =
        (referer &&
          mongoose.isValidObjectId(referer) &&
          (await Org.findOne({ _id: referer }).lean({ defaults: true }))) ||
        null;

      // if the user is referred
      if (hasReferred) {
        newUser = new User({ firstName, lastName, email, password, referer });
      } else {
        newUser = new User({ firstName, lastName, email, password });
      }

      // updating the referer
      hasReferred && (await Org.updateOne({ _id: referer }, { $push: { refers: newUser._id } }));

      await newUser.save();

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

      const userCreated = await User.findOne({ _id: newUser._id }).lean({ defaults: true });

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
        const user = await User.findOneAndUpdate({ _id: accountId }, { verified: true }).lean({
          defaults: true,
        });
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
        employeeName: orgEmployeeName,
        employeePosition: orgEmployeePosition,
        subscribed: subscribe,
      });

      await newOrg.save();

      const affiliateLink = `${process.env.APP_URL}/auth/register?refererId=${newOrg._id}`;
      const updatedOrg = await Org.findOneAndUpdate(
        { _id: newOrg._id },
        { affiliateLink }
      ).populate("refers");

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

      const token = await newOrg.generateToken();

      res.cookie(process.env.COOKIE_NAME, token, {
        maxAge: process.env.COOKIE_MAX_AGE,
        httpOnly: true,
        signed: true,
      });

      res
        .status(201)
        .json({ affiliateLink, msg: "We just emailed you the affiliate Link", org: updatedOrg });
    } catch (err) {
      next(err);
    }
  },

  loginOrg: async function (req, res, next) {
    try {
      const { email, password } = req.body;

      const org = await Org.findOne({ email }).populate("refers");

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

      res.status(200).json({ msg: "Login Successful", org });
    } catch (err) {
      next(err);
    }
  },

  getRefererInfo: async function (req, res, next) {
    try {
      const { orgId } = req.params;
      const org = await Org.findOne({ _id: orgId });
      if (!org) {
        res.status(400).json({ msg: "Invalid Referer" });
      }
      res.status(200).json({ org });
    } catch (err) {
      next(err);
    }
  },

  sendResponseIfLoggedIn: function (req, res) {
    res.status(201).send(req.user || req.org);
  },

  logout: function (_req, res) {
    res.clearCookie(process.env.COOKIE_NAME);
    res.status(201).json({ msg: "Logged out" });
  },
};
