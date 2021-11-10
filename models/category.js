const mongoose = require("mongoose");

const dataSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String, required: true, trim: true },
  price: { type: Number, required: true },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
  timeLimit: { type: Number, required: true },
});

const Category = new mongoose.model("Category", dataSchema);

module.exports = Category;
