const mongoose = require("mongoose");

const dataSchema = new mongoose.Schema({
  audio: { name: String, url: String },
  video: { name: String, url: String },
  background_music: { name: String, url: String },
  passive_gif: { name: String, url: String },
  passive_background_sound: { name: String, url: String },
});

const Alc = new mongoose.model("Alc", dataSchema);

module.exports = Alc;
