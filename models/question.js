const mongoose = require("mongoose");

const dataSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: { type: Array },
  answers: { type: Array, required: true },
  type: { type: String, required: true, enum: ["mcq", "text"] },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  timeLimit: { type: Number, required: true },
});

const Question = new mongoose.model("Question", dataSchema);

module.exports = Question;
