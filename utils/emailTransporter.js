const nodemailer = require("nodemailer");

module.exports = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
  tls: { rejectUnauthorized: true },
});
