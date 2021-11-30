const mongoose = require("mongoose");

const dataSchema = new mongoose.Schema({
  audio: { name: String, url: String },
  video: { name: String, url: String },
  background_music: { name: String, url: String },
  passive_audio: { name: String, url: String },
  passive_images: [{ name: String, url: String }],
  passive_background_sound: { name: String, url: String },
  timeout: Number,
  viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: "People" }],
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", ref: "Category" },
});

const Alc = new mongoose.model("Alc", dataSchema);

module.exports = Alc;
