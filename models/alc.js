const mongoose = require("mongoose");
const mongooseLeanDefaults = require("mongoose-lean-defaults").default;

// this model will contain assets for alc. A category can have a lot of concerts
// the user can choose any of them for his learning session
const dataSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  passive_image: { name: { type: String, required: true }, url: { type: String, required: true } },
  background_sound: {
    name: { type: String, required: true },
    url: { type: String, required: true },
  },
  passive_background_sound: {
    name: { type: String, required: true },
    url: { type: String, required: true },
  },
});

dataSchema.plugin(mongooseLeanDefaults);

const Alc = new mongoose.model("Alc", dataSchema);

module.exports = Alc;
