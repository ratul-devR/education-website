const express = require("express");
const router = express.Router();

const { getSettings, newSettings, editSettings } = require("../controllers/settingsController");

const authorizeAdmin = require("../middlewares/auth/authorizeAdmin");

router.get("/", getSettings);

router.post("/newSettings", authorizeAdmin, newSettings);

router.put("/editSettings/:settingId", authorizeAdmin, editSettings);

module.exports = router;
