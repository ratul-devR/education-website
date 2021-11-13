const express = require("express");

// controllers
const {
  getCategories,
  postCategory,
  deleteCategory,
  addQuestion,
  getQuestions,
  deleteQuestion,
  getUsers,
  getOrganizations,
} = require("../controllers/adminController");

const router = express.Router();

// all the routes in this file are protected, it means only the admin can access it

// for getting all the categories
router.get("/categories", getCategories);
// for adding a new category
router.post("/post_category", postCategory);
// for getting all the questions of a category
router.get("/category/:categoryId/questions", getQuestions);
// for deleting a category
router.delete("/delete_category/:id", deleteCategory);

// for getting all the user information's
router.get("/users", getUsers);

// for getting all the org's
router.get("/organizations", getOrganizations);

// for adding a question to the category
router.post("/add_question/:categoryId", addQuestion);
// deleting a question
router.delete("/question/:questionId/:categoryId", deleteQuestion);

module.exports = router;
