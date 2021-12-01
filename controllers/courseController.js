const mongoose = require("mongoose");

const Category = require("../models/category");
// const Questions = require("../models/question");
const User = require("../models/people");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

module.exports = {
  getCourses: async function (req, res, next) {
    try {
      const courses = await Category.find({}).populate("questions");

      res.status(200).json({ courses });
    } catch (err) {
      next(err);
    }
  },

  getCourseAccordingToId: async function (req, res, next) {
    try {
      const { courseId } = req.params;

      if (!mongoose.isValidObjectId(courseId)) {
        res.sendStatus(404);
      }

      const course = await Category.findOne({ _id: courseId });

      if (!course) {
        res.sendStatus(404);
      }

      const userCourses = req.user.coursesPurchased;

      let courseExists = false;

      for (let i = 0; i < userCourses.length; i++) {
        if (userCourses[i]._id == courseId) {
          courseExists = true;
        }
      }

      res.status(200).json({ course, courseExists });
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

  getCourseAndQuestions: async function (req, res, next) {
    try {
      const { courseId } = req.body;

      const user = req.user;

      const course = await Category.findOne({ _id: courseId });

      const courseQuestions = course.questions;

      let userQuestions = [];

      for (let i = 0; i < courseQuestions.length; i++) {
        const courseQuestion = courseQuestions[i];
        if (!user.questions.includes(courseQuestion)) {
          userQuestions.push(courseQuestion);
        }
      }

      let courseExists = false;
      for (let i = 0; i < user.courses.length; i++) {
        const userCourse = user.courses[i];
        if (userCourse._id == courseId) {
          courseExists = true;
        }
      }

      if (!courseExists) {
        await User.updateOne({ _id: user._id }, { $push: { courses: courseId } });
      }
      let updatedUser = user;
      if (userQuestions.length > 0) {
        updatedUser = await User.findOneAndUpdate(
          { _id: user._id },
          { $push: { questions: userQuestions } }
        ).populate("courses");
      }

      res.status(201).json({ msg: "Course was added successfully!", user: updatedUser });
    } catch (err) {
      next(err);
    }
  },

  purchaseCourse: async function (req, res, next) {
    try {
      const { amount, courseId, userId } = req.body;

      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "usd",
        metadata: {
          courseId,
          userId,
        },
      });

      res.status(200).json({ client_secret: paymentIntent.client_secret });
    } catch (err) {
      next(err);
    }
  },

  addCourse: async function (req, res) {
    const event = req.body;

    switch (event.type) {
      case "payment_intent.succeeded": {
        const { courseId, userId } = event.data.object.metadata;

        const user = await User.findOne({ _id: userId });

        let courseExists = false;
        for (let i = 0; i < user.coursesPurchased.length; i++) {
          if (user.coursesPurchased[i] == courseId) {
            courseExists = true;
          }
        }

        let updatedUser;

        if (!courseExists) {
          updatedUser = await User.findOneAndUpdate(
            { _id: user._id },
            { $push: { coursesPurchased: courseId } }
          );
        }

        res.status(201).json({
          msg: "This course was successfully added. Now you can start learning!",
          user: updatedUser || user,
        });
      }
    }
  },
};
