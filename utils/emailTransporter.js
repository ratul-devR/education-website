const nodemailer = require("nodemailer");

module.exports = nodemailer.createTransport({
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
  tls: { rejectUnauthorized: false },
});
