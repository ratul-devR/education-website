const User = require("../models/people");
const Org = require("../models/org");
const Settings = require("../models/settings");

const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const transporter = require("../utils/emailTransporter");

module.exports = {
  login: async function (req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await User.findOneAndUpdate({ email }, { loginRequired: false }, { new: true });

      if (user) {
        const passwordMatched = await bcrypt.compare(password, user.password);

        if (passwordMatched) {
          const authToken = await user.generateToken();

          res.cookie(process.env.COOKIE_NAME, authToken, {
            maxAge: process.env.COOKIE_MAX_AGE,
            httpOnly: true,
            signed: true,
          });

          res.status(201).json({ msg: `Welcome back ${user.firstName}`, user, token: authToken });
        } else {
          res.status(400).json({ msg: "Invalid credentials" });
        }
      } else {
        res.status(404).json({ msg: "Your email doesn't exists" });
      }
    } catch (err) {
      next(err);
    }
  },

  register: async function (req, res, next) {
    try {
      const { firstName, lastName, age, email, password, referer, phone } = req.body;

      let newUser;

      const hasReferred =
        (referer &&
          mongoose.isValidObjectId(referer) &&
          (await Org.findOne({ _id: referer }).lean({ defaults: true }))) ||
        null;

      // if the user is referred
      if (hasReferred) {
        newUser = new User({ firstName, lastName, email, password, referer, age, phone });
      } else {
        newUser = new User({ firstName, lastName, email, password, age, phone });
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

      // send a whats app message to the user if he has entered phone number
      if (newUser.phone) {
      }

      const emailConfirmationMessage = (await Settings.findOne({})).emailConfirmationMessage;

      const emailConfirmationSubject = emailConfirmationMessage
        .split("\n")[0]
        .replace(/{{name}}/g, newUser.firstName);

      const linkText = JSON.parse(emailConfirmationMessage.split("\n")[1]).link;

      let messageHTML = emailConfirmationMessage
        .split("\n")
        .filter((_, index) => index !== 0 && index !== 1)
        .join("<br />");

      const domain =
        (process.env.NODE_ENV === "development" ? req.protocol : "https") + "://" + req.get("host");

      const linkHTML = `<a href="${
        domain + `/get_auth/confirmEmail/${newUser._id}`
      }">${linkText}</a>`;

      messageHTML = messageHTML.replace(/{{name}}/g, newUser.firstName);
      messageHTML = messageHTML.replace(/{{link}}/g, linkHTML);

      // send a confirmation email to the user
      await transporter.sendMail({
        from: `EDconsulting<${process.env.EMAIL}>`,
        to: newUser.email,
        subject: emailConfirmationSubject,
        html: messageHTML,
      });

      // const oneDay = 86400000; // one day = that amount of ms
      // const notificationDuration = (await Settings.findOne({})).notificationTimeSpan || 1;
      // const repeatingDays = (await Settings.findOne({})).reminderDuration || 1;

      // for (let i = 1; i <= repeatingDays; i++) {
      //   await agenda.schedule(
      //     new Date().getTime() + oneDay * notificationDuration * i,
      //     "sendWAMessage",
      //     {
      //       userId: newUser._id,
      //     }
      //   );
      // }

      const userCreated = await User.findOne({ _id: newUser._id }).lean({ defaults: true });

      res.status(201).json({
        msg: "We have sent you an email for confirmation",
        user: userCreated,
        token: authToken,
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

  confirmEmailFromMobile: async function (req, res, next) {
    try {
      const { accountId } = req.params;

      if (mongoose.isValidObjectId(accountId)) {
        const user = await User.findOneAndUpdate({ _id: accountId }, { verified: true }).lean({
          defaults: true,
        });
        if (!user) {
          res.status(404).json({ msg: "User not found" });
        } else {
          res.status(201).json({ msg: "Verification successful", user });
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

      const affiliateLink = `${process.env.APP_URL}/auth/register?refererId=${newOrg._id}`;

      newOrg.affiliateLink = affiliateLink;

      await newOrg.save();
      await newOrg.populate("refers");

      let emailText = (await Settings.findOne({})).affiliateLinkMessage
        .replace(/{{name}}/g, newOrg.name)
        .split("\n")
        .filter((_, index) => index !== 0 && index !== 1)
        .join("<br />");

      const emailSubject = (await Settings.findOne({})).affiliateLinkMessage
        .replace(/{{name}}/g, newOrg.name)
        .split("\n")[0];

      const emailLinkText = JSON.parse(
        (await Settings.findOne({})).affiliateLinkMessage.split("\n")[1]
      ).link;
      const linkHTML = `<a href="${affiliateLink}">${emailLinkText}</a>`;

      emailText = emailText.replace(/{{link}}/g, linkHTML);

      await transporter.sendMail({
        from: `EDconsulting<${process.env.EMAIL}>`,
        to: newOrg.email,
        subject: emailSubject,
        html: emailText,
      });

      const token = await newOrg.generateToken();

      res.cookie(process.env.COOKIE_NAME, token, {
        maxAge: process.env.COOKIE_MAX_AGE,
        httpOnly: true,
        signed: true,
      });

      res
        .status(201)
        .json({ affiliateLink, msg: "We just emailed you the affiliate Link", org: newOrg, token });
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

      res.status(200).json({ msg: "Login Successful", org, token });
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

  resetPasswordSendEmail: async function (req, res, next) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });

      if (!user) {
        res.status(400).json({ msg: "Your account doesn't exists" });
      } else {
        let emailText = (await Settings.findOne({})).resetPasswordMessage
          .replace(/{{name}}/g, user.firstName)
          .split("\n")
          .filter((_, index) => index !== 0 && index !== 1)
          .join("<br />");

        const emailSubject = (await Settings.findOne({})).resetPasswordMessage
          .replace(/{{name}}/g, user.firstName)
          .split("\n")[0];

        const emailLinkText = JSON.parse(
          (await Settings.findOne({})).resetPasswordMessage.split("\n")[1]
        ).link;
        const linkHTML = `<a href="${process.env.APP_URL}/auth/resetPass/${user._id}">${emailLinkText}</a>`;

        emailText = emailText.replace(/{{link}}/g, linkHTML);

        await transporter.sendMail({
          from: `EDconsulting<${process.env.EMAIL}>`,
          to: user.email,
          subject: emailSubject,
          html: emailText,
        });

        res.status(200).json({ msg: "We just sent you an email" });
      }
    } catch (err) {
      next(err);
    }
  },

  resetPass: async function (req, res, next) {
    try {
      const { password } = req.body;
      const { userId } = req.params;

      const user = await User.findOne({ _id: userId });

      if (!user) {
        res.status(400).json({ msg: "Your account doesn't exist" });
      } else {
        user.password = password;
        await user.save();
        res.status(200).json({ msg: "You password has been updated" });
      }
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
