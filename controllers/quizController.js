const Category = require("../models/category");
const User = require("../models/people");

module.exports = {
  getUserQuestionsOfQuiz: async function (req, res, next) {
    try {
      const { courseId } = req.params;

      const user = await User.findOne({ _id: req.user._id }).populate("questions");
      const course = await Category.findOne({ _id: courseId });

      const courseQuestions = [];

      for (let i = 0; i < user.questions.length; i++) {
        if (user.questions[i].category == courseId) {
          courseQuestions.push(user.questions[i]);
        }
      }

      res.status(200).json({ courseQuestions, course });
    } catch (err) {
      next(err);
    }
  },

  onCorrectAnswer: async function (req, res, next) {
    try {
      const { questionId } = req.body;
      const user = req.user;

      // remove the question and never show it to him cause he knows the answer now
      await User.updateOne({ _id: user._id }, { $pull: { questions: questionId } });
      // add the question to known list
      let questionExists = false;

      for (let i = 0; i < user.questionsKnown.length; i++) {
        const question = user.questionsKnown[i];
        if (question == questionId) {
          questionExists = true;
        }
      }

      if (!questionExists) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: user._id },
          { $push: { questionsKnown: questionId } },
          { new: true }
        ).populate("courses");

        res
          .status(201)
          .json({ user: updatedUser, msg: "This question will not be shown to you again" });
      } else {
        const updatedUser = await User.findOne({ _id: req.user._id }).populate("courses");
        res
          .status(201)
          .json({ user: updatedUser, msg: "This question will not be shown to you again" });
      }
    } catch (err) {
      next(err);
    }
  },

  dontKnow: async function (req, res, next) {
    try {
      const { questionId } = req.body;
    } catch (err) {
      next(err);
    }
  },
};
