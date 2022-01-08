const mongoose = require("mongoose");
const mongooseLeanDefaults = require("mongoose-lean-defaults").default;

const dataSchema = new mongoose.Schema({
  passive_image: {name: {type: String, required: true}, url: {type: String, required: true}},
  background_sound: {name: String, url: String},
  passive_background_sound: { name: String, url: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", ref: "Category" },
});

dataSchema.plugin(mongooseLeanDefaults);

const Alc = new mongoose.model("Alc", dataSchema);

module.exports = Alc;
