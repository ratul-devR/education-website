const express = require("express");
const router = express.Router();

const { getSettings, newSettings, editSettings } = require("../controllers/settingsController");

router.get("/", getSettings);

router.post("/newSettings", newSettings)

router.put("/editSettings/:settingId", editSettings)

module.exports = router;
