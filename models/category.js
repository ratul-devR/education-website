const mongoose = require("mongoose");
const mongooseLeanDefaults = require("mongoose-lean-defaults").default;

const dataSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String, required: true, trim: true },
  frontPageText: { type: String, required: true, trim: true },
  price: { type: Number, required: true },
  displayPrice: { type: String, required: true },
  passPercentage: { type: Number, required: true },
  learningPhasePaid: { type: Boolean, required: true },
  checkingPhasePaid: { type: Boolean, required: true },
  quizIns: String,
  concertIns: String,
  // The answer is shown in pink and the question is shown in gray
  // in exception, it's the opposite
  // this is only applied for MCQ type questions in the product
  exceptionalConcertFormat: Boolean,

  // payment before checking phase message
  cpPaymentMessage: String,
  // payment after checking phase message
  lpPaymentMessage: String,
  // font-size for the course shown in dashboard
  courseTextSize: String,
  // checking phase payment message font-size
  cpPaymentMessageTextSize: String,
  // learning phase payment message font-size
  lpPaymentMessageTextSize: String,
  // once the user reaches that, then he will be asked for payment after checking phase
  unknownQuestionLimitForPurchase: Number,
  // before checking phase
  cpLimit: Number,

  prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
  checkedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "People" }],
  purchasedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "People" }],
  completedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "People" }],
});

dataSchema.plugin(mongooseLeanDefaults);

const Category = new mongoose.model("Category", dataSchema);

module.exports = Category;
