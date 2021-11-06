const express = require("express");

// controllers
const { getUserQuestionsOfQuiz, onCorrectAnswer } = require("../controllers/quizController");

const router = express.Router();

// for getting all the user questions under a course
router.get("/getUserQuestionsOfCourse/:courseId", getUserQuestionsOfQuiz);

// for updating the user field after giving the correct answer of a question
router.post("/correctAnswer", onCorrectAnswer);

module.exports = router;
