const mongoose = require("mongoose");

const Category = require("../models/category");
const Question = require("../models/question");

module.exports = {
  getCategories: async function (req, res, next) {
    try {
      const categories = (await Category.find({}).populate("questions")) || [];

      res.status(201).json({ categories });
    } catch (err) {
      next(err);
    }
  },

  postCategory: async function (req, res, next) {
    try {
      const { categoryName } = req.body;

      const categoryExist = (await Category.findOne({ name: categoryName })) || null;

      if (categoryExist) {
        res.status(400).json({ msg: "This category already exists" });
      } else {
        const newCategory = new Category({ name: categoryName });
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
      const { question, options, answer } = req.body;

      const newQuestion = new Question({ question, options, answer, category: categoryId });

      await newQuestion.save();

      await Category.updateOne({ _id: categoryId }, { $push: { questions: newQuestion } });

      res.status(201).json({ msg: "Question has been added to the category" });
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

      const updatedQuestions = (await Category.findOne({ _id: categoryId }).populate("questions"))
        .questions;

      res.status(201).json({
        msg: `"${deletedQuestion.question}" has been removed`,
        questions: updatedQuestions,
      });
    } catch (err) {
      next(err);
    }
  },
};
