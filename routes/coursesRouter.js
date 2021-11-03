const express = require("express");

const { getCourses, getAuthUserCourses, addCourse } = require("../controllers/courseController");

const router = express.Router();

// for sending all the courses
router.get("/", getCourses);

// for getting all the courses of the auth user
router.get("/getAuthUserCourses", getAuthUserCourses);

// for adding a course
router.post("/addCourse", addCourse);

module.exports = router;
