const express = require("express");

// controllers
const {
  getCategories,
  postCategory,
  deleteCategory,
  addQuestion,
  getQuestions,
  deleteQuestion,
} = require("../controllers/adminController");

const router = express.Router();

// all the routes in this file is protected, it means only the admin can access it

// * all the category related routes
// for getting all the categories
router.get("/categories", getCategories);
// for adding a new category
router.post("/post_category", postCategory);
// for deleting a category
router.delete("/delete_category/:id", deleteCategory);
// for adding a question to the category
router.post("/add_question/:categoryId", addQuestion);
// for getting all the questions of a category
router.get("/category/:categoryId/questions", getQuestions);
// deleting a question
router.delete("/question/:questionId/:categoryId", deleteQuestion);

module.exports = router;
