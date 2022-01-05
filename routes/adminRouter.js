const express = require("express");

const uploadCsvFile = require("../middlewares/admin/uploadCsvFile");
const quizAssetUpload = require("../middlewares/admin/uploadQuizAsset");
const uploadQuestionAssets = require("../middlewares/admin/uploadQuestionAssets");
const uploadFilesMiddleware = require("../middlewares/admin/uploadFiles");

// controllers
const {
  getCategories,
  postCategory,
  deleteCategory,
  addQuestion,
  addQuestionsFromCsv,
  getQuestions,
  deleteQuestion,
  getUsers,
  sendMails,
  getOrganizations,
  uploadQuizAssets,
  getQuizAssets,
  deleteQuizAssets,
  updateQuestion,
  updateQuestions,
  uploadFiles,
  getFiles,
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

// for uploading files
router.post("/uploadFiles", uploadFilesMiddleware, uploadFiles);
// for getting uploaded files
router.get("/getFiles", getFiles);

// for uploading quiz assets
router.post("/upload_assets", quizAssetUpload, uploadQuizAssets);
// for getting uploaded quiz assets
router.get("/get_assets", getQuizAssets);
// for deleting uploaded quiz asset
router.delete("/delete_quiz_assets", deleteQuizAssets);

// for getting all the org's
router.get("/organizations", getOrganizations);
// for sending emails to organizations
router.post("/sendMails", sendMails);

// for updating question details
router.put("/updateQuestion/:questionId", updateQuestion);
// for updating question details globally under a category
router.put("/updateQuestions/:categoryId", updateQuestions);

// for adding a question to the category
router.post("/add_question/:categoryId", uploadQuestionAssets, addQuestion);
// for adding multiple questions using a .csv file only
router.post("/add_questions_from_csv", uploadCsvFile, addQuestionsFromCsv);
// deleting a question
router.delete("/question/:questionId/:categoryId", deleteQuestion);

module.exports = router;
