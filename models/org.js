const mongoose = require("mongoose");

const dataSchema = new mongoose.Schema({
  name: { type: String, required: true },
  streetAddress: { type: String, required: true },
  postalCode: { type: String, required: true },
  province: { type: String, required: true },
  phone: { type: String, required: true },
  type: { type: String, required: true },
  employeeName: { type: String, required: true },
  employeePosition: { type: String, required: true },
  affiliateLink: String,
  refers: [{ type: mongoose.Schema.Types.ObjectId, ref: "People" }],
});

const Org = new mongoose.model("Org", dataSchema);

module.exports = Org;
