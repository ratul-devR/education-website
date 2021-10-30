const express = require("express");

// controllers
const {
  getCategories,
  postCategory,
  deleteCategory,
  addQuestion,
} = require("../controllers/adminController");

const router = express.Router();

// for getting all the categories
router.get("/categories", getCategories);

// for adding a new category
router.post("/post_category", postCategory);

// for deleting a category
router.delete("/delete_category/:id", deleteCategory);

// for adding a question to the category
router.post("/add_question/:categoryId", addQuestion);

module.exports = router;
