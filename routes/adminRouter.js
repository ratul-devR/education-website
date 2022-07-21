const express = require("express");

const uploadCsvFile = require("../middlewares/admin/uploadCsvFile");
const quizAssetUpload = require("../middlewares/admin/uploadQuizAsset");
const uploadQuestionAssets = require("../middlewares/admin/uploadQuestionAssets");
const uploadFilesMiddleware = require("../middlewares/admin/uploadFiles");
const uploadFileToConvert = require("../middlewares/admin/uploadFileToConvert");

// controllers
const {
  getCategories,
  postCategory,
  updateCategory,
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
  deleteFile,
  getFilesOfCategory,
  searchFiles,
  getConvertedFiles,
  convertFile,
  deleteFileConvertedFile,
  getRawCategories,
  renewUserHandler,
} = require("../controllers/adminController");

const router = express.Router();

// all the routes in this file are protected, it means only the admin can access it

// for getting all the categories with questions and prerequisites populated
router.get("/categories", getCategories);
// for getting all the categories without the questions and prerequisites populated
router.get("/raw_categories", getRawCategories);
// for adding a new category
router.post("/post_category", postCategory);
// for updating a category
router.put("/update_category/:categoryId", updateCategory);
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
// for getting files of a specific category
router.get("/get_files/categoryId/:categoryId", getFilesOfCategory);
// for getting specific searched file
router.get("/searchFiles/:searchQuery", searchFiles);
// for deleting a file
router.delete("/deleteFile/:fileId", deleteFile);

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

// for getting all converted files
router.get("/getConvertedFiles", getConvertedFiles);
// for uploading a file to convert
router.post("/convertFile", uploadFileToConvert, convertFile);
// for deleting a converted file
router.delete("/deleteConvertedFile/:fileId", deleteFileConvertedFile);

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

// for renewing a user
router.put("/renew_user/:userId", renewUserHandler);

module.exports = router;
