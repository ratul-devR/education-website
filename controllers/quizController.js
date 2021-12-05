const Category = require("../models/category");
const User = require("../models/people");
const QuizAsset = require("../models/quizAsset");
const Question = require("../models/question");

const agenda = require("../jobs/agenda");

module.exports = {
  getUserQuestionsOfQuiz: async function (req, res, next) {
    try {
      const { courseId } = req.params;

      const user = await User.findById(req.user._id).populate("questions");

      const course = await Category.findOne({ _id: courseId });

      if (!course) {
        res.status(404).json({ msg: "Course Not Found! Please stop navigating with URL's" });
      }

      const courseQuestions = [];

      if (user.questions.length > 0) {
        for (let i = 0; i < user.questions.length; i++) {
          if (user.questions[i].category == courseId) {
            courseQuestions.push(user.questions[i]);
          }
        }
      }

      let hasAllPrerequisites = true;

      // checking if the user has all the prerequisites to access this course
      for (let i = 0; i < course.prerequisites.length; i++) {
        const prerequisite = course.prerequisites[i];
        if (!user.coursesCompleted.includes(prerequisite)) {
          hasAllPrerequisites = false;
        }
      }

      res.status(200).json({ courseQuestions, course, hasAllPrerequisites });
    } catch (err) {
      next(err);
    }
  },

  // this is for activation phase where the questions, the didn't knew will be shown
  getUserUnknownQuestions: async function (req, res, next) {
    try {
      const { courseId } = req.params;

      const user = await User.findOne({ _id: req.user._id }).populate(
        "questionsUnknown unknownQuestionsPack"
      );
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

      let hasAllPrerequisites = true;

      // checking if the user has all the prerequisites to access this course
      for (let i = 0; i < course.prerequisites.length; i++) {
        const prerequisite = course.prerequisites[i];
        if (!user.coursesCompleted.includes(prerequisite)) {
          hasAllPrerequisites = false;
        }
      }

      const unknownQuestionsPack = [];
      // checking if the user has questions in his pack from this category
      for (let i = 0; i < user.unknownQuestionsPack.length; i++) {
        const unknownQuestion = user.unknownQuestionsPack[i];
        if (unknownQuestion.category.toString() == courseId.toString()) {
          unknownQuestionsPack.push(unknownQuestion);
        }
      }

      res
        .status(200)
        .json({ courseQuestions, course, hasPurchased, hasAllPrerequisites, unknownQuestionsPack });
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
        ).populate("courses questionsKnown");

        // now let's see if the user has gained the knowing percentage, so he can mark this course as done
        const question = await Question.findOne({ _id: questionId }).populate("category");
        const passPercentage = question.category.passPercentage;
        const totalQuestionsInCategory = question.category.questions.length;

        let questionsUserKnowsInThisCategory = [];
        for (let i = 0; i < updatedUser.questionsKnown.length; i++) {
          const questionKnown = updatedUser.questionsKnown[i];
          if (questionKnown.category.toString() == question.category._id.toString()) {
            questionsUserKnowsInThisCategory.push(questionKnown);
          }
        }

        const hasCompleted =
          (questionsUserKnowsInThisCategory.length * 100) / totalQuestionsInCategory >=
          passPercentage;

        // if the user has completed/passed and if he already hasn't this course already finished in this DB
        if (hasCompleted && !updatedUser.coursesCompleted.includes(question.category._id)) {
          await User.updateOne(
            { _id: updatedUser._id },
            { $push: { coursesCompleted: question.category._id } }
          );
        }

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

      let updatedUser = await User.findOneAndUpdate(
        { _id: req.user._id },
        { $pull: { questionsUnknown: questionId } }
      ).populate("courses");
      let questionExists = false;
      for (let i = 0; i < req.user.questionsKnown.length; i++) {
        const questionKnown = req.user.questionsKnown[i];
        if (questionKnown.toString() === questionId.toString()) {
          questionExists = true;
        }
      }

      if (!questionExists) {
        updatedUser = await User.findOneAndUpdate(
          { _id: req.user._id },
          { $push: { questionsKnown: questionId } }
        ).populate("courses");
      }

      // for repetition phase this question will be shown again in the checking phase after several time
      // fix the rejection error in agenda
      agenda.schedule(new Date().getTime() + 10000, "after1day", {
        userId: updatedUser._id,
        question: questionId,
      });

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

      for (let i = 0; i < user.unknownQuestionsPack.length; i++) {
        const question = user.unknownQuestionsPack[i];
        if (question == questionId) {
          questionExists = true;
        }
      }

      await User.updateOne({ _id: user._id }, { $pull: { questions: questionId } });

      if (!questionExists) {
        await User.updateOne({ _id: user._id }, { $push: { unknownQuestionsPack: questionId } });
        res.status(200).json({ msg: "done" });
      } else {
        res.status(200).json({ msg: "done" });
      }
    } catch (err) {
      next(err);
    }
  },
};
