const mongoose = require("mongoose");

const dataSchema = new mongoose.Schema({
  appSubTitle: String,
  lang: String,
  notificationTimeSpan: Number, // in days
  reminderMessage: String,
  requestMessage: String,
  reminderDuration: Number, // in days
  emailConfirmationMessage: String,
});

const Settings = new mongoose.model("Setting", dataSchema);

module.exports = Settings;
