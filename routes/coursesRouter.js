const express = require("express");

const checkLogin = require("../middlewares/auth/checkLogin");

const {
  getCourses,
  addCourse,
  getCourseAccordingToId,
  purchaseCourse,
  buyPackage,
  buyPackageWebhookHandle,
} = require("../controllers/courseController");

const router = express.Router();

// for sending all the courses
router.get("/", getCourses);

// for getting single course information according to the id
router.get("/course/:courseId", checkLogin, getCourseAccordingToId);

// for purchasing a course
router.post("/purchaseCourse", checkLogin, purchaseCourse);

// for buying a package
router.post("/buyPackage", checkLogin, buyPackage);

// for adding the package after a successful payment
router.post("/buyPackageWebhook", buyPackageWebhookHandle);

// for adding a course after a successful payment
router.post("/webhook", addCourse);

module.exports = router;
