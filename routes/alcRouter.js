const express = require("express");

// controllers
const {
  uploadSingleAlc,
  getItems,
  deleteItem,
  getRandomItem,
} = require("../controllers/alcController");

// middlewares
const uploadAlcFiles = require("../middlewares/alc/uploadAlcFiles");
const authorizeAdmin = require("../middlewares/auth/authorizeAdmin");

const router = express.Router();

// for uploading a single item (the user must be authorized as the admin)
router.post("/", authorizeAdmin, uploadAlcFiles, uploadSingleAlc);

// for getting all the items
router.get("/", authorizeAdmin, getItems);

// for deleting a single ite
router.delete("/:id", authorizeAdmin, deleteItem);

// for getting a random item to show on the client side this one just requires regular login
router.get("/getRandomItem", getRandomItem);

module.exports = router;
