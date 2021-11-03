const Category = require("../models/category");
// const Questions = require("../models/question");
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

  addCourse: async function (req, res, next) {
    try {
      const { courseId } = req.body;
      const user = req.user;

      if (!courseId) {
        res.status(400).json({ msg: "courseId is required" });
      }

      // check if the course already exists for the user
      // if it does, the user has to pay for it otherwise we will provide 10 free questions from the category
      let courseExists = false;

      for (let i = 0; i < user.courses.length; i++) {
        const course = user.courses[i];
        if (course == courseId) {
          courseExists = true;
        }
      }

      // if the course exists the user has to pay for more questions
      if (courseExists) {
        // the guy is not authorized to add more questions
        res.status(401).json({ msg: "Payment required" });
        // otherwise we will provide him 10 free questions from the category
      } else {
        const category = await Category.findOne({ _id: courseId });
        const userQuestionsFromTheCategory = user.questions;

        // if there is no questions available in this category
        if (category.questions.length == 0) {
          res.status(404).json({ msg: "No Questions found in this Category" });
        } else {
          let limitedQuestions = [];

          for (let i = 0; i < category.questions.length; i++) {
            const categoryQuestion = category.questions[i];
            // maximum 10 questions can be get for free
            if (limitedQuestions.length < 10) {
              /* if the user has already some questions in his schema, then we need to check
              which questions he hasn't got and push them
              otherwise just put 10 questions from the category */
              if (userQuestionsFromTheCategory.length > 0) {
                userQuestionsFromTheCategory.map((question) => {
                  if (question != categoryQuestion) {
                    // a lot of duplicated might be available cause the length is 10
                    // so we have remove the duplicates
                    limitedQuestions.push(categoryQuestion);
                  }
                });
              } else {
                limitedQuestions.push(categoryQuestion);
              }
            }
          }

          // the final output of this program this contains all the new questions which can be added for free
          const finalOutput = [...new Set(limitedQuestions)];

          // finally update the user courses and questions field
          await User.updateOne({ _id: req.user._id }, { $push: { questions: finalOutput } });
          await User.updateOne({ _id: req.user._id }, { $push: { courses: courseId } });

          // send the response
          res.status(201).json({
            msg: `Course was added successfully and you got ${finalOutput.length} questions for free. If you want more, you have to purchase them`,
          });
        }
      }
    } catch (err) {
      next(err);
    }
  },
};
