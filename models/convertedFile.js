const mongoose = require("mongoose");

const dataSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
  },
  { timestamps: true }
);

const ConvertedFile = new mongoose.model("ConvertedFile", dataSchema);

module.exports = ConvertedFile;
