const Category = require("../models/category");
const User = require("../models/people");
const QuizAsset = require("../models/quizAsset");
const Question = require("../models/question");
const Alc = require("../models/alc");

// import agenda from "../jobs/agenda"

module.exports = {
  getUserQuestionsOfQuiz: async function (req, res, next) {
    try {
      const { courseId } = req.params;

      const user = await User.findById(req.user._id).lean({ defaults: true });
      const course = await Category.findOne({ _id: courseId })
        .lean({ defaults: true })
        .populate("questions prerequisites");

      if (!course) {
        res.status(404).json({ msg: "Course Not Found! Please stop navigating with Urls" });
      }

      // questions the user hasn't checked yet will be shown in the checking phase
      const courseQuestions = await Question.find({
        $and: [
          { category: course._id },
          { knownUsers: { $nin: [req.user._id] } },
          { unknownUsers: { $nin: [req.user._id] } },
          { packUsers: { $nin: [req.user._id] } },
        ],
      }).lean({ defaults: true });

      let hasAllPrerequisites = true;

      // checking if the user has all the prerequisites to access this course
      for (let i = 0; i < course.prerequisites.length; i++) {
        const prerequisite = course.prerequisites[i];
        prerequisite.completedBy = prerequisite.completedBy.map((user) => user.toString());
        if (!prerequisite.completedBy.includes(user._id.toString())) {
          hasAllPrerequisites = false;
        }
      }

      res.status(200).json({ courseQuestions, course, hasAllPrerequisites });
    } catch (err) {
      next(err);
    }
  },

  // this is for activation phase where the questions, he didn't knew will be shown (unknownQuestions)
  getUserUnknownQuestions: async function (req, res, next) {
    try {
      const { courseId } = req.params;

      const user = await User.findOne({ _id: req.user._id }).lean({ defaults: true });

      const course = await Category.findOne({ _id: courseId })
        .lean({ defaults: true })
        .populate("prerequisites");

      // questions the user doesn't know
      const courseQuestions = await Question.find({
        $and: [{ category: course._id }, { unknownUsers: { $in: [user._id] } }],
      }).lean({ defaults: true });

      let hasAllPrerequisites = true;

      for (let i = 0; i < course.prerequisites.length; i++) {
        const prerequisite = course.prerequisites[i];
        prerequisite.completedBy = prerequisite.completedBy.map((user) => user.toString());
        if (!prerequisite.completedBy.includes(req.user._id.toString())) {
          hasAllPrerequisites = false;
        }
      }

      // the pack of questions the user has to purchase
      const unknownQuestionsPack = await Question.find({
        $and: [{ category: course._id }, { packUsers: { $in: [req.user._id] } }],
      }).lean({ defaults: true });

      res.status(200).json({ courseQuestions, course, hasAllPrerequisites, unknownQuestionsPack });
    } catch (err) {
      next(err);
    }
  },

  getQuizAssets: async function (_req, res, next) {
    try {
      const asset = (await QuizAsset.find({}).lean({ defaults: true }))[0] || null;
      res.status(200).json({ asset });
    } catch (err) {
      next(err);
    }
  },

  onCorrectAnswer: async function (req, res, next) {
    try {
      const { questionId } = req.body;
      const user = req.user;

      const question = await Question.findOne({ _id: questionId })
        .lean({ defaults: true })
        .populate("category");

      // add the question to known list if the user already doesn't knows that
      question.knownUsers = question.knownUsers.map((user) => user.toString());
      let userAlreadyKnows = question.knownUsers.includes(user._id.toString());
      if (!userAlreadyKnows) {
        await Question.updateOne({ _id: question._id }, { $push: { knownUsers: user._id } }).lean({
          defaults: true,
        });
      }

      if (!userAlreadyKnows) {
        // let's see if the user has gained the pass percentage of knowing questions in this course
        const knownQuestionsInTheCategory = await Question.find({
          $and: [{ category: question.category._id }, { knownUsers: { $in: [user._id] } }],
        }).lean({ defaults: true });
        const passPercentage = question.category.passPercentage;
        const totalQuestionsInCategory = question.category.questions.length;

        const usersPercentage =
          (knownQuestionsInTheCategory.length * 100) / totalQuestionsInCategory;
        const hasPassed = usersPercentage >= passPercentage;

        // if the user has passed and has earned the percentage, then push his is under the category list
        if (hasPassed) {
          await Category.updateOne(
            { _id: question.category._id },
            { $push: { completedBy: user._id } }
          ).lean({ defaults: true });
        }
      }

      res.status(201).json({ msg: "done" });
    } catch (err) {
      next(err);
    }
  },

  apCorrectAnswer: async function (req, res, next) {
    try {
      const { questionId } = req.body;
      const user = req.user;

      const question = await Question.findOneAndUpdate(
        { _id: questionId },
        { $pull: { unknownUsers: user._id } }
      );

      question.knownUsers = question.knownUsers.map((user) => user.toString());
      const questionAlreadyKnown = question.knownUsers.includes(user._id.toString());

      if (!questionAlreadyKnown) {
        await Question.updateOne({ _id: question._id }, { $push: { knownUsers: user._id } }).lean({
          defaults: true,
        });
      }

      // for repetition phase this question will be shown again in the checking phase after several time
      const after1Day = new Date().getTime() + 86400000;
      const after7Day = new Date().getTime() + after1Day * 7;
      const after16Day = new Date().getTime() + after1Day * 16;
      const after35Day = new Date().getTime() + after1Day * 35;

      /* agenda.schedule(after1Day, "repetition", {
        userId: user._id,
        question: questionId,
      });
      agenda.schedule(after7Day, "repetition", {
        userId: user._id,
        question: questionId,
      });
      agenda.schedule(after16Day, "repetition", {
        userId: user._id,
        question: questionId,
      });
      agenda.schedule(after35Day, "repetition", {
        userId: user._id,
        question: questionId,
      }); */

      res.status(201).json({ msg: "done" });
    } catch (err) {
      next(err);
    }
  },

  dontKnow: async function (req, res, next) {
    try {
      const { questionId } = req.body;
      const user = req.user;

      const question = await Question.findOne({ _id: questionId }).lean({ defaults: true });

      // if he is a repeated user and if because he has not given the right answer,
      // so he will have to learn it again in the specified learning phase
      question.repeatedUsers = question.repeatedUsers.map((user) => user.toString());
      const repeatedUser = question.repeatedUsers.includes(user._id.toString());
      if (repeatedUser) {
        await Alc.updateOne({ _id: question.concert }, { $pull: { viewers: user._id } });
      }

      question.packUsers = question.packUsers.map((user) => user.toString());
      let alreadyPacked = question.packUsers.includes(user._id.toString());

      if (!alreadyPacked) {
        await Question.updateOne({ _id: question._id }, { $push: { packUsers: user._id } }).lean({
          defaults: true,
        });
      }

      res.status(200).json({ msg: "done" });
    } catch (err) {
      next(err);
    }
  },
};
