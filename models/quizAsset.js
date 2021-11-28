const mongoose = require("mongoose");

const dataSchema = new mongoose.Schema({
  background_sound: { name: String, url: String },
  positive_sound: { name: String, url: String },
  negative_sound: { name: String, url: String },
});

const QuizAsset = new mongoose.model("QuizAsset", dataSchema);

module.exports = QuizAsset;
