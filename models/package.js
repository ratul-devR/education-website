const mongoose = require("mongoose");

const dataSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: String, required: true },
  products: [{ type: mongoose.Types.ObjectId, ref: "Category" }],
});

const Package = new mongoose.model("Package", dataSchema);

module.exports = Package;
