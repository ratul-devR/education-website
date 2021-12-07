const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongooseLeanDefaults = require("mongoose-lean-defaults").default;

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

dataSchema.plugin(mongooseLeanDefaults);

dataSchema.pre("save", function (next) {
  const org = this;
  if (!org.isModified("password")) return next();
  bcrypt.hash(org.password, 12, (err, hash) => {
    if (err) next(err);
    org.password = hash;
    next();
  });
});

// for generting jwt
dataSchema.methods.generateToken = function () {
  try {
    const org = this;
    const token = jwt.sign({ _id: org._id.toString() }, process.env.JWT_SECRET);
    return token;
  } catch (err) {
    console.log(err.message || err);
  }
};

const Org = new mongoose.model("Org", dataSchema);

module.exports = Org;
