const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const dataSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  streetAddress: { type: String, required: true },
  city: { type: String, required: true },
  postalCode: { type: String, required: true },
  province: { type: String, required: true },
  phone: { type: String, required: true },
  type: { type: String, required: true },
  employeeName: { type: String, required: true },
  employeePosition: { type: String, required: true },
  affiliateLink: String,
  subscribed: { type: Boolean, required: true },
  refers: [{ type: mongoose.Schema.Types.ObjectId, ref: "People" }],
  peoples: Array,
});

dataSchema.pre("save", function (next) {
  const org = this;
  if (!org.isModified("password")) return next();
  bcrypt.hash(org.password, 12, (err, hash) => {
    if (err) next(err);
    org.password = hash;
    next();
  });
});

const Org = new mongoose.model("Org", dataSchema);

module.exports = Org;
