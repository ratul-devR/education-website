const mongoose = require("mongoose");

const dataSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: { type: Array, required: true },
  answer: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
});

const Question = new mongoose.model("Question", dataSchema);

module.exports = Question;
