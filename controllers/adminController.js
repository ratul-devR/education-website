const mongoose = require("mongoose");
const csvJson = require("csvtojson/v2");
const request = require("request");
const { unlink } = require("fs");
const path = require("path");

const Category = require("../models/category");
const Question = require("../models/question");
const User = require("../models/people");
const Org = require("../models/org");

const transporter = require("../utils/emailTransporter");

module.exports = {
  getCategories: async function (req, res, next) {
    try {
      const categories = (await Category.find({}).populate("questions")) || [];

      res.status(201).json({ categories });
    } catch (err) {
      next(err);
    }
  },

  getUsers: async function (req, res, next) {
    try {
      const users = await User.find({}).populate("referer");
      res.status(200).json({ users });
    } catch (err) {
      next(err);
    }
  },

  getOrganizations: async function (req, res, next) {
    try {
      const organizations = await Org.find({});

      res.status(200).json({ organizations });
    } catch (err) {
      next(err);
    }
  },

  sendMails: async function (req, res, next) {
    try {
      const { subject, email } = req.body;
      const listOfMails = (await Org.find({ subscribed: true })).map((org) => org.email);
      if (listOfMails.length === 0) {
        res.status(400).json({ msg: "There are no organizations or they are not subscribed" });
      }
      await transporter.sendMail({
        from: `${process.env.EMAIL}`,
        to: listOfMails,
        subject,
        text: email,
      });

      res.status(200).json({ msg: `Message sent to all ${listOfMails.length} organizations` });
    } catch (err) {
      next(err);
    }
  },

  postCategory: async function (req, res, next) {
    try {
      const { title, description, price, timeLimit } = req.body;

      const categoryExist = (await Category.findOne({ name: title })) || null;

      if (categoryExist) {
        res.status(400).json({ msg: "This category already exists" });
      } else {
        const newCategory = new Category({ name: title, description, price, timeLimit });
        await newCategory.save();

        const updatedCategories = await Category.find({});
        res
          .status(201)
          .json({ msg: `"${newCategory.name}" has been created`, categories: updatedCategories });
      }
    } catch (err) {
      next(err);
    }
  },

  deleteCategory: async function (req, res, next) {
    try {
      const { id } = req.params;

      const deletedDoc = await Category.findByIdAndDelete({ _id: id });

      await Question.deleteMany({ category: id });

      const updatedDocs = await Category.find({});

      res
        .status(201)
        .json({ msg: `"${deletedDoc.name}" has been deleted`, categories: updatedDocs });
    } catch (err) {
      next(err);
    }
  },

  addQuestion: async function (req, res, next) {
    try {
      const { categoryId } = req.params;
      const { question, options, answer, type } = req.body;

      let newQuestion;

      if (type === "mcq") {
        newQuestion = new Question({ question, options, answer, category: categoryId, type });
      } else {
        newQuestion = new Question({ question, answer, category: categoryId, type });
      }

      await newQuestion.save();

      await Category.updateOne({ _id: categoryId }, { $push: { questions: newQuestion } });

      res
        .status(201)
        .json({ msg: "Question has been added to the category", question: newQuestion });
    } catch (err) {
      next(err);
    }
  },

  addQuestionsFromCsv: async function (req, res, next) {
    try {
      const file = req.file;
      const { category } = req.body;
      const filePath =
        req.protocol + "://" + req.get("host") + `/uploads/question-csv-files/${file.filename}`;
      // all the json data parsed from the csv file is here
      const jsonData = await csvJson().fromStream(request.get(filePath));

      // now let's convert the options field from string to array, if it exists
      for (let i = 0; i < jsonData.length; i++) {
        const question = jsonData[i];
        question.category = category;
        if (question.options) {
          question.options = question.options.split("/ ");
        } else {
          question.options = [];
        }
      }

      // now let's see if valid or required properties are added in the json data
      // if it isn't then throw error! and also delete the previous file
      for (let i = 0; i < jsonData.length; i++) {
        const question = jsonData[i];
        if (
          !question.question ||
          !question.answer ||
          !question.type ||
          (question.type === "mcq" && question.options.length === 0)
        ) {
          res.status(400).json({
            msg: "Some required properties are missing in your csv file! or some of the values may be invalid",
          });
          unlink(
            path.join(__dirname, `/../public/uploads/question-csv-files/${file.filename}`),
            (err) => (err ? err : null)
          );
        }
      }

      // now time to save them!
      const uploadedDocs = await Question.insertMany(jsonData);

      // now update the fields of the category
      await Category.updateOne({ _id: category }, { $push: { questions: uploadedDocs } });

      // once everything is done, delete the file. Cause we don't need that
      unlink(
        path.join(__dirname, `/../public/uploads/question-csv-files/${file.filename}`),
        (err) => (err ? err : null)
      );

      res.status(200).json({
        msg: "The set of questions were uploaded from your csv file!",
        questions: uploadedDocs,
      });
    } catch (err) {
      next(err);
    }
  },

  getQuestions: async function (req, res, next) {
    try {
      const { categoryId } = req.params;

      if (mongoose.isValidObjectId(categoryId)) {
        const category =
          (await Category.findOne({ _id: categoryId }).populate("questions")) || null;

        if (category) {
          res.status(200).json({ questions: category.questions, category });
        } else {
          res.status(404).json({ msg: "No category found" });
        }
      } else {
        res.status(404).json({ msg: "Invalid Category" });
      }
    } catch (err) {
      next(err);
    }
  },

  deleteQuestion: async function (req, res, next) {
    try {
      const { questionId, categoryId } = req.params;

      const deletedQuestion = await Question.findByIdAndDelete({ _id: questionId });

      const updatedQuestions = (
        await Category.findOneAndUpdate(
          { _id: categoryId },
          { $pull: { questions: questionId } }
        ).populate("questions")
      ).questions;

      res.status(201).json({
        msg: `"${deletedQuestion.question}" has been removed`,
        questions: updatedQuestions,
      });
    } catch (err) {
      next(err);
    }
  },
};
