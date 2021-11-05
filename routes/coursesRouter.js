const express = require("express");

const checkLogin = require("../middlewares/auth/checkLogin");

const {
  getCourses,
  getAuthUserCourses,
  addCourse,
  getCourseAccordingToId,
  purchaseCourse,
} = require("../controllers/courseController");

const router = express.Router();

// for sending all the courses
router.get("/", checkLogin, getCourses);

// for getting single course information according to the id
router.get("/course/:courseId", checkLogin, getCourseAccordingToId);

// for getting all the courses of the auth user
router.get("/getAuthUserCourses", checkLogin, getAuthUserCourses);

// for purchasing a course
router.post("/purchaseCourse", purchaseCourse);

// for adding a course after a successful payment
router.post("/webhook", addCourse);

module.exports = router;
