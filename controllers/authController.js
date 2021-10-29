const User = require("../models/people");
const bcrypt = require("bcrypt");

module.exports = {
  login: async function (req, res, next) {
    try {
      const { email, password } = req.body;

      const user = (await User.findOne({ email })) || null;

      if (user) {
        const passwordMatched = await bcrypt.compare(password, user.password);

        if (passwordMatched) {
          const authToken = await user.generateToken();

          res.cookie(process.env.COOKIE_NAME, authToken, {
            maxAge: process.env.COOKIE_MAX_AGE,
            httpOnly: true,
            signed: true,
          });

          res.status(201).json({ msg: `Welcome back ${user.firstName}`, user });
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
};
