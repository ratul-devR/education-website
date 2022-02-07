const mongoose = require("mongoose");

const dataSchema = new mongoose.Schema({
  appSubTitle: String,
  lang: String
});

const Settings = new mongoose.model("Setting", dataSchema);

module.exports = Settings;
