const mongoose = require("mongoose");

const dataSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
});

const File = new mongoose.model("File", dataSchema);

module.exports = File;
