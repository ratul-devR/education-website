const express = require("express");

const {
  uploadSingleAlc,
  getItems,
  deleteItem,
  getItemAccordingToId,
  getItemsOfCategory
} = require("../controllers/alcController");

// middlewares
const uploadAlcFiles = require("../middlewares/alc/uploadAlcFiles");
const authorizeAdmin = require("../middlewares/auth/authorizeAdmin");

const router = express.Router();

// for uploading a single item (the user must be authorized as the admin)
router.post("/", authorizeAdmin, uploadAlcFiles, uploadSingleAlc);

// for getting all the items
router.get("/", getItems);

// for getting all items of category
router.get("/courseId/:courseId", getItemsOfCategory)

// for deleting a single ite
router.delete("/:id", authorizeAdmin, deleteItem);

// for getting item according to the category id
router.get("/getItem/:alcId", getItemAccordingToId);

module.exports = router;
