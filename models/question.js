const mongoose = require("mongoose");
const mongooseLeanDefaults = require("mongoose-lean-defaults").default;

const dataSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: { type: Array },
  answers: { type: Array, required: true },
  type: { type: String, required: true, enum: ["mcq", "text"] },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  timeLimit: { type: Number, required: true },
  concert: { type: mongoose.Schema.Types.ObjectId, ref: "Alc" },

  knownUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "People" }],
  unknownUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "People" }],
  packUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "People" }],
});

dataSchema.plugin(mongooseLeanDefaults);

const Question = new mongoose.model("Question", dataSchema);

module.exports = Question;
