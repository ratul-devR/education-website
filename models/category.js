const mongoose = require("mongoose");

const dataSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
  },
  { timestamps: true }
);

const Category = new mongoose.model("Category", dataSchema);

module.exports = Category;
