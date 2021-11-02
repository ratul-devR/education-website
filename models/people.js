const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const dataSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, trim: true },
  role: { type: String, enum: ["user", "admin", "organization"], default: "user" },

  // if any org has referred him
  referer: { type: mongoose.Schema.Types.ObjectId, ref: "Org" },

  // courses he has purchased
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
  // questions he has got
  question: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
});

// for hashing the password
dataSchema.pre("save", function (next) {
  const user = this;
  if (!user.isModified("password")) return next();
  bcrypt.hash(user.password, 12, (err, hash) => {
    if (err) return next(err);
    user.password = hash;
    next();
  });
});

// for generating jwt
dataSchema.methods.generateToken = function () {
  try {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
    return token;
  } catch (err) {
    console.log(err.message || err);
  }
};

const User = new mongoose.model("People", dataSchema);

module.exports = User;
