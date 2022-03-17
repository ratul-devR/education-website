const mongoose = require("mongoose");

const dataSchema = new mongoose.Schema({
  appSubTitle: String,
  lang: String,
  notificationTimeSpan: Number, // in days
  reminderMessage: String,
  requestMessage: String,
  reminderDuration: Number, // in days

  emailConfirmationMessage: String, // the message which will be sent for confirming email
  resetPasswordMessage: String, // the message which will be sent for resetting the password
  affiliateLinkMessage: String, // the message which will be sent for affiliate link
});

const Settings = new mongoose.model("Setting", dataSchema);

module.exports = Settings;
