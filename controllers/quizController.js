const Category = require("../models/category");
const User = require("../models/people");
const QuizAsset = require("../models/quizAsset");

module.exports = {
  getUserQuestionsOfQuiz: async function (req, res, next) {
    try {
      const { courseId } = req.params;

      const user = await User.findOne({ _id: req.user._id }).populate("questions");
      const course = await Category.findOne({ _id: courseId });

      const courseQuestions = [];

      if (user.questions.length > 0) {
        for (let i = 0; i < user.questions.length; i++) {
          if (user.questions[i].category == courseId) {
            courseQuestions.push(user.questions[i]);
          }
        }
      }

      res.status(200).json({ courseQuestions, course });
    } catch (err) {
      next(err);
    }
  },

  // this is for activation phase where the questions, the didn't knew will be shown
  getUserUnknownQuestions: async function (req, res, next) {
    try {
      const { courseId } = req.params;

      const user = await User.findOne({ _id: req.user._id }).populate("questionsUnknown");
      const course = await Category.findOne({ _id: courseId });

      const courseQuestions = [];

      if (user.questionsUnknown.length > 0) {
        for (let i = 0; i < user.questionsUnknown.length; i++) {
          if (user.questionsUnknown[i].category == courseId) {
            courseQuestions.push(user.questionsUnknown[i]);
          }
        }
      }

      const hasPurchased = user.coursesPurchased.includes(courseId);

      res.status(200).json({ courseQuestions, course, hasPurchased });
    } catch (err) {
      next(err);
    }
  },

  getQuizAssets: async function (req, res, next) {
    try {
      const asset = (await QuizAsset.find({}))[0] || null;
      res.status(200).json({ asset });
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

        res.status(201).json({ user: updatedUser });
      } else {
        const updatedUser = await User.findOne({ _id: req.user._id }).populate("courses");
        res.status(201).json({ user: updatedUser });
      }
    } catch (err) {
      next(err);
    }
  },

  apCorrectAnswer: async function (req, res, next) {
    try {
      const { questionId } = req.body;

      const updatedUser = await User.findOneAndUpdate(
        { _id: req.user._id },
        { $pull: { questionsUnknown: questionId } }
      ).populate("courses");

      res.status(201).json({ user: updatedUser });
    } catch (err) {
      next(err);
    }
  },

  dontKnow: async function (req, res, next) {
    try {
      const { questionId } = req.body;
      const user = req.user;

      let questionExists = false;

      for (let i = 0; i < user.questionsUnknown.length; i++) {
        const question = user.questionsUnknown[i];
        if (question == questionId) {
          questionExists = true;
        }
      }

      await User.updateOne({ _id: user._id }, { $pull: { questions: questionId } });

      if (!questionExists) {
        await User.updateOne({ _id: user._id }, { $push: { questionsUnknown: questionId } });
        res.status(200).json({ msg: "done" });
      } else {
        res.status(200).json({ msg: "done" });
      }
    } catch (err) {
      next(err);
    }
  },
};
