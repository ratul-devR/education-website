const mongoose = require("mongoose");
const mongooseLeanDefaults = require('mongoose-lean-defaults').default

const dataSchema = new mongoose.Schema({
  positive_sound: { name: String, url: String },
  negative_sound: { name: String, url: String },
});

dataSchema.plugin(mongooseLeanDefaults)

const QuizAsset = new mongoose.model("QuizAsset", dataSchema);

module.exports = QuizAsset;
