const mongoose = require("mongoose");

const dataSchema = new mongoose.Schema({
  appSubTitle: { type: String, required: true },
});

const Settings = new mongoose.model("Setting", dataSchema);

module.exports = Settings;
