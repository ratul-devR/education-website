const mongoose = require("mongoose");

const Category = require("../models/category");
const Question = require("../models/question");
const User = require("../models/people");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

module.exports = {
  getCourses: async function (_req, res, next) {
    try {
      const courses = await Category.find({}).lean({ defaults: true });

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

      const course = await Category.findOne({ _id: courseId }).lean({ defaults: true });

      if (!course) {
        res.sendStatus(404);
      }

      course.purchasedBy = course.purchasedBy.map((user) => user.toString());
      let courseExists = course.purchasedBy.includes(req.user._id.toString());

      const unknownQuestionPack = await Question.find({
        $and: [{ category: course._id }, { packUsers: { $in: [req.user._id] } }],
      });

      res.status(200).json({ course, courseExists, unknownQuestionPack });
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
          type: "course",
        },
      });

      res.status(200).json({ client_secret: paymentIntent.client_secret });
    } catch (err) {
      next(err);
    }
  },

  buyPackage: async function (req, res, next) {
    try {
      const { amount, courseId, userId } = req.body;
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "usd",
        metadata: { courseId, userId, type: "package" },
      });
      res.status(200).json({ client_secret: paymentIntent.client_secret });
    } catch (err) {
      next(err);
    }
  },

  buyPackageWebhookHandle: async function (req, res, next) {
    try {
      const event = req.body;
      switch (event.type) {
        case "payment_intent.succeeded": {
          const { type, courseId, userId } = event.data.object.metadata;

          if (type === "package") {
            const user = await User.findOne({ _id: userId }).lean({ defaults: true });
            const course = await Category.findOne({ _id: courseId }).lean({ defaults: true });
            const courseQuestionsToPack = await Question.find({
              $and: [{ category: course._id }, { packUsers: { $in: [user._id] } }],
            });
            // after the successful payment add user to the unknown list and remove the user from pack list cause this package has been purchased
            await Question.updateMany(
              {
                _id: { $in: courseQuestionsToPack.map((question) => question._id) },
              },
              {
                $push: { unknownUsers: user._id },
                $pull: { packUsers: user._id },
              }
            );
          }

          res.status(201).json({ msg: "The work has been done" });
          break;
        }

        default: {
          return res.status(400).end();
        }
      }
    } catch (err) {
      next(err);
    }
  },

  addCourse: async function (req, res) {
    const event = req.body;

    switch (event.type) {
      case "payment_intent.succeeded": {
        const { courseId, userId, type } = event.data.object.metadata;

        if (type === "course") {
          const user = await User.findOne({ _id: userId }).lean({ defaults: true });
          const course = await Category.findOne({ _id: courseId }).lean({ defaults: true });
          course.purchasedBy = course.purchasedBy.map((user) => user.toString());
          const courseAlreadyPurchased = course.purchasedBy.includes(userId.toString());
          if (!courseAlreadyPurchased) {
            await Category.updateOne({ _id: course._id }, { $push: { purchasedBy: user._id } });
          }
        }

        res.status(201).json({ msg: "The work has been done" });
        break;
      }
      default: {
        return res.status(400).end();
      }
    }
  },
};
