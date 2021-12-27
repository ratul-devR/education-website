const express = require("express");

// controllers
const {
  uploadSingleAlc,
  getItems,
  deleteItem,
  userViewedConcert,
  getItemAccordingToId,
  getItemAccordingToItemId,
} = require("../controllers/alcController");

// middlewares
const uploadAlcFiles = require("../middlewares/alc/uploadAlcFiles");
const authorizeAdmin = require("../middlewares/auth/authorizeAdmin");

const router = express.Router();

// for uploading a single item (the user must be authorized as the admin)
router.post("/", authorizeAdmin, uploadAlcFiles, uploadSingleAlc);

// for getting all the items
router.get("/", authorizeAdmin, getItems);

// for getting a specific item according to item id
router.get("/id/:id", authorizeAdmin, getItemAccordingToItemId);

// for deleting a single ite
router.delete("/:id", authorizeAdmin, deleteItem);

// for getting item according to the category id
router.get("/getItem/:id", getItemAccordingToId);

// after the user has watched the concert, it should not be shown to the user again
router.post("/userViewedConcert", userViewedConcert);

module.exports = router;
