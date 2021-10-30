const mongoose = require("mongoose");

const dataSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: { type: Array, required: true, minlength: 2 },
  answer: { type: String, required: true },
});

const Question = new mongoose.model("Question", dataSchema);

module.exports = Question;
