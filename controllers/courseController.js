const Category = require("../models/category");
const Questions = require("../models/question");
const User = require("../models/people");

module.exports = {
  getCourses: async function (req, res, next) {
    try {
      const courses = await Category.find({}).populate("questions");

      res.status(200).json({ courses });
    } catch (err) {
      next(err);
    }
  },

  getAuthUserCourses: async function (req, res, next) {
    try {
      res.status(200).json({ courses: req.user.courses });
    } catch (err) {
      next(err);
    }
  },

  addQuestion: async function (req, res, next) {
    try {
      const { courseId } = req.body;

      const course = await Category.findOne({ _id: courseId });

      const userCourses = req.user.courses;

      if (userCourses.includes(course._id)) {
        res.status(201).json({ msg: "You need to purchase questions now" });
      } else {
        res.status(201).json({ msg: "It's free you will get 10 questions" });
      }
    } catch (err) {
      next(err);
    }
  },
};
